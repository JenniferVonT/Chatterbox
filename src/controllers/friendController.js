/**
 * @file Defines the friendController class.
 * @module controllers/friendController
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

import { UserModel } from '../models/userModel.js'

/**
 * Encapsulates the friend controller.
 */
export class FriendController {
  /**
   * Provide req.friend to the route if :id is present.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @param {string} user - The username for the account to load.
   */
  async loadFriend (req, res, next, user) {
    try {
      // Get the account.
      const account = await UserModel.findById(user)

      // If the account is not found, throw an error.
      if (!account) {
        const error = new Error('The account you requested does not exist.')
        error.status = 404
        throw error
      }

      // Provide the account to req.
      req.friend = account

      // Next middleware.
      next()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Renders the friends view when logged in.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async friends (req, res, next) {
    try {
      const viewData = null

      res.render('main/friends', { viewData })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Handles searching for users..
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async searchUsers (req, res, next) {
    const { searchTerm } = req.body

    // Create a regex pattern to match usernames that start with the search term.
    const regexPattern = new RegExp(`^${searchTerm}`)

    try {
      // Find all users with complete or partial matches, only get the username, user-id and profileImg.
      const searchResults = await UserModel.find(
        { username: regexPattern },
        { username: 1, id: 1, profileImg: 1 }
      )

      res.render('main/friends', { viewData: { results: searchResults } })
    } catch (error) {

    }
  }

  /**
   * Handles sending a friend request.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async sendFriendRequest (req, res, next) {
    try {
      const friend = req.friend
      const sessionUser = req.session.user

      // Insert the id of the person making the request into the requested users db.
      friend.friendReqs.push({ id: sessionUser.id })

      await friend.save({ validateBeforeSave: false })

      req.session.flash = { type: 'success', text: 'Your friend request was successfully sent!' }
      res.redirect('../')
    } catch (error) {
      req.session.flash = { type: 'danger', text: 'Something went wrong, try again!' }
      res.redirect('../')
    }
  }

  /**
   * Handles adding a friend to the friends-list.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async add (req, res, next) {
    try {
      // Get the user-id that send the request and the current session user.
      const request = req.friend.id
      const sessionID = req.session.user.id
      const user = await UserModel.findById(sessionID)
      const requestUser = await UserModel.findById(request)

      // Remove the request from the friendReq list and add the user to the friend-list instead.
      user.friendReqs = user.friendReqs.filter(req => req.id !== request)
      req.session.user.friendReqs = user.friendReqs

      user.friends.push({ id: request })
      req.session.user.friends = user.friends

      requestUser.friends.push({ id: sessionID })

      // Save only the changed objects.
      await user.save({ validateBeforeSave: false })
      await requestUser.save({ validateBeforeSave: false })

      req.session.flash = { type: 'success', text: 'The friend was successfully added!' }
      res.redirect('../')
    } catch (error) {
      req.session.flash = { type: 'danger', text: 'Something went wrong, try again!' }
      res.redirect('../')
    }
  }

  /**
   * Handles denying a friend request.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async deny (req, res, next) {
    try {
      // Get the user-id that send the request and the current session user.
      const request = req.friend.id
      const sessionID = req.session.user.id
      const user = await UserModel.findById(sessionID)

      // Remove the request from the friendReq list and save.
      user.friendReqs = user.friendReqs.filter(req => req.id !== request)

      req.session.user.friendReqs = user.friendReqs

      await user.save({ validateBeforeSave: false })

      req.session.flash = { type: 'success', text: 'The friend request was denied and removed!' }
      res.redirect('../')
    } catch (error) {
      req.session.flash = { type: 'danger', text: 'Something went wrong, try again!' }
      res.redirect('../')
    }
  }

  /**
   * Handles removing of a friend on the friends-list.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async remove (req, res, next) {}
}
