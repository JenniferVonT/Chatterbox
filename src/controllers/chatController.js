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
      let encryptionKey = ''

      for (const friend of localUser.friends) {
        if (friend.chatId === chatId.id) {
          otherUserID = friend.userId
          encryptionKey = friend.encryptionKey
          break
        }
      }

      const otherUser = await UserModel.findById(otherUserID)

      const localUserObj = {
        id: req.session.user.id,
        username: localUser.username,
        profileImg: localUser.profileImg,
        chatID: chatId.id,
        cryptKey: encryptionKey
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

      res.locals.view = 'chat'
      res.render('chats/chat', { viewData })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Render the video/audio chat view.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async video (req, res, next) {
    try {
      const viewData = {
        user: req.localUser,
        otherUser: req.otherUser
      }

      res.locals.view = 'chat'
      res.render('chats/video', { viewData })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Saves the message in the db.
   *
   * @param {object} message - The message object containing the message, chatID and userID.
   * @param {boolean} readState - If the message has been read (true) or not (false).
   */
  async saveChatMessage (message, readState) {
    try {
      const chat = await MessageModel.findOne({ chatId: message.key })

      // If there isn't already a collection for that chatId make one.
      // Otherwise just insert the message and save the model.
      if (!chat) {
        await MessageModel.create({
          chatId: message.key,
          messages: [{
            user: message.user,
            iv: message.iv,
            data: message.data,
            read: readState
          }]
        })
      } else {
        chat.messages.push({ user: message.user, iv: message.iv, data: message.data, read: readState })
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
   * @param {string} userID - The id of the user being sent the chat.
   */
  async sendSavedChat (webSocketConnection, chatID, userID) {
    try {
      // Calculate the date 2 weeks ago from now
      const twoWeeksAgo = new Date()
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

      // Find the chat document
      const chat = await MessageModel.findOne({ chatId: chatID })

      // If there is no chat found just return nothing.
      if (!chat) {
        return
      }

      // Filter out messages older than 2 weeks and keep only the recent ones
      chat.messages = chat.messages.filter(msg => msg.createdAt >= twoWeeksAgo)

      // Update the read status if the message being sent doesn't match the user id that is recieving the msg.
      chat.messages.forEach(msg => {
        if (msg.user !== userID) {
          msg.read = true
        }
      })

      // Save the updated chat document
      await chat.save({ validateBeforeSave: false })

      const dataToSend = {
        messages: chat.messages,
        encryptionKey: chat.encryptionKey
      }

      webSocketConnection.send(JSON.stringify(dataToSend))
    } catch (error) {
      logger.error(error)
    }
  }
}
