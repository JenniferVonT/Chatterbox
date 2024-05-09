/**
 * @file This module contains the setup of the WebSocket server.
 * @module config/webSocketServer
 * @author Mats Loock
 * @author Jennifer von Trotta-Treyden
 * @version 1.0.0
 */

// Import necessary modules
// import { ChatModel } from '../models/chatModel.js'
import { MessageModel } from '../models/messageModel.js'
import { logger } from './winston.js'
import WebSocket, { WebSocketServer } from 'ws'

export const wss = new WebSocketServer({ noServer: true })

// Handle WebSocket connections
wss.on('connection', async (webSocketConnection, connectionRequest) => {
  logger.silly('WebSocket: A user connected')

  // Add event listeners to the WebSocket connection
  webSocketConnection.addEventListener('close', () => logger.silly('WebSocket: A user disconnected'))
  webSocketConnection.addEventListener('error', (error) => logger.error('WebSocket error', { error }))
  webSocketConnection.addEventListener('message', async (message) => {
    try {
      logger.silly(`ws - received message: ${message}`)

      // Parse the incoming message
      const obj = JSON.parse(message.data)

      // Check if the message is of type 'message'
      if (obj.type === 'message') {
        const chat = await MessageModel.findOne({ chatId: obj.key })

        if (!chat) {
          await MessageModel.create({
            chatId: obj.key,
            messages: [{
              user: obj.user,
              message: obj.data
            }]
          })
        } else {
          chat.messages.push({ user: obj.user, message: obj.data })
        }

        // Broadcast the message to all WebSocket connections.
        wss.clients.forEach((client) => {
          if (client.readyState === 1 && WebSocket.OPEN === 1) {
            client.send(JSON.stringify({
              type: 'message',
              data: obj.data,
              user: obj.user,
              key: obj.key
            }))
          }
        })
      }
    } catch (error) {
      logger.error('Error processing WebSocket message:', error)
      logger.silly('Something went wrong in the websocketserver: ', error)
      webSocketConnection.close()
    }
  })
})
