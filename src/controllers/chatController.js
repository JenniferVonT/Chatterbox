/**
 * @file Defines the chatController class.
 * @module controllers/chatController
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

import { UserModel } from '../models/userModel.js'

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
        profileImg: localUser.profileImg
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
}
