/**
 * @file Defines the chatController class.
 * @module controllers/chatController
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

import { UserModel } from '../models/userModel.js'
import { MessageModel } from '../models/messageModel.js'
import { logger } from '../config/winston.js'

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
   * Saves the message in the db.
   *
   * @param {object} message - The message object containing the message, chatID and userID.
   */
  async saveChatMessage (message) {
    try {
      const chat = await MessageModel.findOne({ chatId: message.key })

      // If there isn't already a collection for that chatId make one.
      // Otherwise just insert the message and save the model.
      if (!chat) {
        await MessageModel.create({
          chatId: message.key,
          messages: [{
            user: message.user,
            message: message.data
          }]
        })
      } else {
        chat.messages.push({ user: message.user, message: message.data })
        await chat.save({ validateBeforeSave: false })
      }
    } catch (error) {
      logger.error(error)
    }
  }

  /**
   * Sends the saved messages in a chat to the ws connection.
   *
   * @param {object} webSocketConnection - The connection
   * @param {string} chatID - The id of the chat.
   */
  async sendSavedChat (webSocketConnection, chatID) {
    // Get the saved messages.
    const convo = await MessageModel.findOne({ chatId: chatID })

    webSocketConnection.send(JSON.stringify(convo.messages))
  }
}
