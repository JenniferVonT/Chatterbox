/**
 * @file This module contains the setup of the WebSocket server.
 * @module config/webSocketServer
 * @author Mats Loock
 * @author Jennifer von Trotta-Treyden
 * @version 1.0.0
 */

// Import necessary modules
import { logger } from './winston.js'
import { ChatController } from '../controllers/chatController.js'
import WebSocket, { WebSocketServer } from 'ws'

export const wss = new WebSocketServer({ noServer: true })
const chatController = new ChatController()

// Create a map to store all the WebSocket connections per chat room.
const chatRooms = new Map()

// Handle WebSocket connections
wss.on('connection', async (webSocketConnection, connectionRequest) => {
  logger.silly('WebSocket: A user connected')

  // See if the chatroom is connected or not.
  const chatID = decodeURIComponent(connectionRequest.url.slice(1))

  // Send all the saved messages to the connection.
  await chatController.sendSavedChat(webSocketConnection, chatID)

  if (!chatRooms.has(chatID)) {
    chatRooms.set(chatID, [])
  }

  chatRooms.get(chatID).push(webSocketConnection)

  webSocketConnection.addEventListener('error', (error) => logger.error('WebSocket error', { error }))
  webSocketConnection.addEventListener('message', async (message) => {
    try {
      logger.silly(`ws - received message: ${message}`)

      // Parse the incoming message
      const obj = JSON.parse(message.data)

      // Check if the message is of type 'message'
      if (obj.type === 'message') {
        const chatId = obj.key

        // Retrieve the WebSocket connection for the chat room
        const connections = chatRooms.get(chatId)

        // Broadcast the message to all WebSocket connections in the chat room
        connections.forEach(connection => {
          if (connection.readyState === WebSocket.OPEN) {
            connection.send(JSON.stringify({
              type: 'message',
              user: obj.user,
              data: obj.data
            }))
          }
        })

        // Save the message in a db.
        await chatController.saveChatMessage(obj)
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

    // Remove the WebSocket connection from all chat rooms.
    chatRooms.forEach((connections, chatId) => {
      chatRooms.set(chatId, connections.filter((conn) => conn !== webSocketConnection))
    })
  })
})
