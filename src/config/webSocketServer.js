/**
 * @file This module contains the setup of the WebSocket server.
 * @module config/webSocketServer
 * @author Mats Loock
 * @author Jennifer von Trotta-Treyden
 * @version 1.0.0
 */

// Import necessary modules
import { ChatModel } from '../models/chatModel.js'
import { MessageModel } from '../models/messageModel.js'
import { router as chatRouter } from '../routes/chatRouter.js'
import { logger } from './winston.js'
import WebSocket, { WebSocketServer } from 'ws'

export const wss = new WebSocketServer({ noServer: true })

// Handle WebSocket connections
wss.on('connection', async (webSocketConnection, connectionRequest) => {
  logger.silly('WebSocket: A user connected')

  // Extract chatId from the connection request
  const chatId = connectionRequest.headers.chatID

  // Ensure chatId is valid and exists
  const savedChat = await ChatModel.findOne({ chatId })

  // If the chatId is not previously stored, store it!
  if (!savedChat) {
    await ChatModel.create({ chatId })
  }

  // Add event listeners to the WebSocket connection
  webSocketConnection.addEventListener('close', () => logger.silly('WebSocket: A user disconnected'))
  webSocketConnection.addEventListener('error', (error) => logger.error('WebSocket error', { error }))
  webSocketConnection.addEventListener('message', async (message) => {
    try {
      logger.silly(`ws - received message: ${message}`)

      // Parse the incoming message
      const obj = JSON.parse(message)

      // Check if the message is of type 'message'
      if (obj.type === 'message') {
        // Save the message to the database
        await MessageModel.create({
          chatId: obj.key,
          data: obj.data,
          user: obj.user
        })

        // Broadcast the message to all WebSocket connections with the same chatId
        wss.clients.forEach((client) => {
          if (client !== webSocketConnection && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'message',
              data: obj.data,
              user: obj.user,
              key: obj.key
            }))
          }
        })

        chatRouter.routeMessage(obj, webSocketConnection)
      }
    } catch (error) {
      logger.error('Error processing WebSocket message:', error)
      logger.silly('Something went wrong in the websocketserver: ', error)
      webSocketConnection.close()
    }
  })
})
