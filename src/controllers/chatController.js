/**
 * @file Defines the chatController class.
 * @module controllers/chatController
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

import { UserModel } from '../models/userModel.js'
import { logger } from '../config/winston.js'
import { MessageModel } from '../models/messageModel.js'
import WebSocket from 'ws'

/**
 * Encapsulates the chat controller.
 */
export class ChatController {
/**
 * Provide req.localUser and req.otherUser to the route if :id is present.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @param {string} user - The username for the account to load.
 */
  async loadUsers (req, res, next, user) {
    try {
      // Get the local session user and chatID.
      const chatId = req.params
      const localUser = await UserModel.findById(req.session.user.id)

      // Get the other user id.
      let otherUserID = ''
      for (const friend of localUser.friends) {
        if (friend.chatId === chatId.id) {
          otherUserID = friend.id
          break
        }
      }

      const otherUser = await UserModel.findById(otherUserID)

      const localUserObj = {
        id: req.session.user.id,
        username: localUser.username,
        profileImg: localUser.profileImg,
        chatID: chatId.id
      }

      const otherUserObj = {
        id: otherUserID,
        username: otherUser.username,
        profileImg: otherUser.profileImg
      }

      // Provide the accounts to req.
      req.localUser = localUserObj
      req.otherUser = otherUserObj

      // Next middleware.
      next()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Render the chat view.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async chat (req, res, next) {
    try {
      const viewData = {
        user: req.localUser,
        otherUser: req.otherUser
      }

      res.render('chats/chat', { viewData })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Handles the recieved message.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async connectSocket (req, res) {
    console.log('Hello')
  }

  /**
   * Handles the recieved message.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async receiveMessage (req, res) {
    try {
      // Send a quick response that the message is recieved.
      res.status(200).send('Message received')

      const payload = req
      const wssServer = res.wss

      logger.silly('Message recieved: ', payload)

      // handle the req payload and save to the DB.
      if (payload.type === 'message') {
        const data = JSON.stringify({
          data: payload.data,
          user: payload.user,
          key: payload.key
        })

        await MessageModel.create({
          data: payload.data,
          user: payload.user,
          key: payload.key
        })

        wssServer.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(data)
          }
        })
      }
    } catch (error) {
      logger.silly('Something went wrong with the websocket message handling: ', error)
    }
  }
}
