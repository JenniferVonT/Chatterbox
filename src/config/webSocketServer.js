/**
 * @file This module contains the setup of the WebSocket server.
 * @module config/webSocketServer
 * @author Jennifer von Trotta-Treyden
 * @version 1.0.0
 */

// Import necessary modules
import { logger } from './winston.js'
import { ChatController } from '../controllers/chatController.js'
import WebSocket, { WebSocketServer } from 'ws'
import { MessageModel } from '../models/messageModel.js'
import { UserModel } from '../models/userModel.js'
import crypto from 'crypto'

export const wss = new WebSocketServer({ noServer: true })
const chatController = new ChatController()

// Create two maps to store all the WebSocket connections per chat room and for all the users.
const chatRooms = new Map()
const users = new Map()

// Handle WebSocket connections
wss.on('connection', async (webSocketConnection, connectionRequest) => {
  logger.silly('WebSocket: A user connected')

  // Decide if it is a chat room connection or a user profile connection.
  const decodeURL = decodeURIComponent(connectionRequest.url)
  const urlParts = decodeURL.split('/')

  const userID = urlParts.pop()
  let chatID = urlParts.pop()

  if (chatID === '') {
    chatID = null
  }

  if ((chatID !== null)) {
    // Handles the connection when it's a chat room.
    chatroomHandler(webSocketConnection, chatID, userID)
  } else if (userID !== null) {
    // Handles the connection when it's a single user connection, when logging in.
    userConnectionHandler(webSocketConnection, userID)
  }

  // Set up heartbeat interval
  const heartbeatInterval = setInterval(() => {
    if (webSocketConnection.readyState === WebSocket.OPEN) {
      // Send heartbeat message to the client
      webSocketConnection.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }))
    }
  }, 30000) // 30 seconds

  webSocketConnection.addEventListener('error', (error) => logger.error('WebSocket error', { error }))
  webSocketConnection.addEventListener('message', async (message) => {
    try {
      logger.silly(`ws - received message: ${message}`)

      // Parse the incoming message
      const obj = JSON.parse(message.data)

      const chatId = obj.key

      // Retrieve the WebSocket connection for the chat rooms.
      const connections = chatRooms.get(chatId)

      if (obj.type === 'message') {
        // Handle when a message in the chat is sent and only one user is connected.
        if (connections.length === 1) {
          // Find the user sending the message.
          const sender = await UserModel.findById(obj.user)
          let receiverID = ''

          // Find the friend that matches the chat id.
          for (const friend of sender.friends) {
            if (friend.chatId === chatId) {
              receiverID = friend.userId
              break
            }
          }

          // Find the receivers WS connection and if it's active send a notification.
          const receiver = users.get(receiverID)

          if (receiver !== undefined && receiver.length !== 0) {
            // Send the notifications to the receiver.
            userConnectionHandler(receiver[0], receiverID)
          }

          // Save the message in a db as unread.
          await chatController.saveChatMessage(obj, false)

          // Send the message to the sender.
          connections[0].send(JSON.stringify({
            type: 'message',
            iv: obj.iv,
            user: obj.user,
            data: obj.data
          }))
        } else {
          // Broadcast the message to all WebSocket connections in the chat room.
          connections.forEach(connection => {
            if (connection.readyState === WebSocket.OPEN) {
              connection.send(JSON.stringify({
                type: 'message',
                iv: obj.iv,
                user: obj.user,
                data: obj.data
              }))
            }
          })

          // Save the message in a db as read.
          await chatController.saveChatMessage(obj, true)
        }
      } else if (obj.type === 'call') { // Handle when a user is calling
        connections.forEach(connection => {
          if (connection.readyState === WebSocket.OPEN) {
            connection.send(JSON.stringify(obj))
          }
        })
      } else if (obj.type === 'endCall' || obj.type === 'confirmation' || obj.type === 'deniedCall') { // Handle when a user either accepts/denies a call or ends an ongoing call.
        // Broadcast the message to all WebSocket connections in the chat room
        connections.forEach(connection => {
          if (connection.readyState === WebSocket.OPEN) {
            connection.send(JSON.stringify(obj))
          }
        })
      } else if (['offer', 'answer', 'ice-candidate', 'activateCamera', 'deactivateCamera'].includes(obj.type)) { // Handle when the user answers a voice call and a webRTC connection opens.
        // Relay the signal to other peers in the chat room.
        connections.forEach(connection => {
          if (connection.readyState === WebSocket.OPEN && connection !== webSocketConnection) {
            connection.send(JSON.stringify(obj))
          }
        })
      }
    } catch (error) {
      logger.error('Error processing WebSocket message:', error)
      logger.silly('Something went wrong in the websocketserver: ', error)
      webSocketConnection.close()
    }
  })

  // Add event listeners to the WebSocket connection
  webSocketConnection.addEventListener('close', () => {
    logger.silly('WebSocket: A user disconnected')

    // Remove the WebSocket connection from the chat room or connected user.
    if (chatID !== null) {
      chatRooms.forEach((connections, chatId) => {
        chatRooms.set(chatId, connections.filter((conn) => conn !== webSocketConnection))
      })
    } else {
      users.forEach((connections, userId) => {
        users.set(userId, connections.filter((conn) => conn !== webSocketConnection))
      })
    }

    // Clear heartbeat interval when the connection is closed
    clearInterval(heartbeatInterval)
  })
})

/**
 * Handles the connection to a chat room.
 *
 * @param {object} webSocketConnection - the connection object for the websocket.
 * @param {string} chatID - The chat rooms id.
 * @param {string} userID - The id of the current user.
 */
async function chatroomHandler (webSocketConnection, chatID, userID) {
  // Find the conversation in the db.
  const convo = await MessageModel.findOne({ chatId: chatID })

  // If it doesn't exist create one and generate a new encryption key.
  if (!convo) {
    // Generate a random symmetric key
    const key = crypto.randomBytes(32) // 256 bits key (32 bytes) for AES-256.

    MessageModel.create({
      chatId: chatID,
      encryptionKey: key.toString('base64')
    })
  }

  // Send all the saved messages to the connection.
  await chatController.sendSavedChat(webSocketConnection, chatID, userID)

  if (!chatRooms.has(chatID)) {
    chatRooms.set(chatID, [])
  }

  chatRooms.get(chatID).push(webSocketConnection)
}

/**
 * Handles when a user logs in or connects to the application.
 *
 * @param {object} webSocketConnection - The websocket connection object.
 * @param {string} userID - The id of the user.
 */
async function userConnectionHandler (webSocketConnection, userID) {
  // Insert the user into the connected users map.
  if (!users.has(userID)) {
    users.set(userID, [])
  }

  const userConnection = users.get(userID)

  if (userConnection.length === 0) {
    userConnection.push(webSocketConnection)
  }

  // Find all the chat rooms connected to the user.
  const user = await UserModel.findById(userID)
  const chatIDs = []

  user.friends.forEach(friend => chatIDs.push(friend.chatId))

  const unreadMessages = []

  // Check if any of the chatrooms have any unread messages.
  for (const chat of chatIDs) {
    const convo = await MessageModel.findOne({ chatId: chat })

    // If there is a chat with that ID check all the messages.
    if (convo) {
      for (const msg of convo.messages) {
        if (msg.read === false && msg.user !== userID) {
          const message = {
            chatID: chat,
            from: msg.user
          }
          unreadMessages.push(message)
        }
      }
    }
  }

  // Send a notification about unread messages to the user.
  if (unreadMessages.length > 0) {
    webSocketConnection.send(JSON.stringify({ type: 'notification - msg', data: unreadMessages }))
  }
}
