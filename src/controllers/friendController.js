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
      // Get the session user from the req.
      const sessionUser = req.session.user

      const friendReqs = await this.getFriendReqList(sessionUser)

      res.render('main/friends', { viewData: { friendReqs } })
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
      const searchResult = await UserModel.find(
        { username: regexPattern },
        { username: 1, id: 1, profileImg: 1 }
      )

      const friendReqs = await this.getFriendReqList(req.session.user)

      const viewData = { results: searchResult.map(result => result.toObject()), friendReqs }

      res.render('main/friends', { viewData })
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
    const friend = req.friend
    const sessionUser = req.session.user

    // Insert the id of the person making the request into the requested users db.
    friend.friendReqs.push({ id: sessionUser.id })

    await friend.save({ validateBeforeSave: false })

    req.session.flash = { type: 'success', text: 'Your friend request was successfully sent!' }
    res.redirect('../')
  }

  /**
   * Handles adding a friend to the friends-list.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async add (req, res, next) {}

  /**
   * Handles removing of a friend on the friends-list.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async remove (req, res, next) {}

  /**
   * Gets the friend requests that is located within the session user,
   * creates an object containing the user objects of the requests.
   *
   * @param {object} sessionUser - The current session user.
   * @returns {object[]} - An array containing user objects.
   */
  async getFriendReqList (sessionUser) {
    // Load the friend requests for the session user
    const friendReqs = []
    for (const friendRequest of sessionUser.friendReqs) {
      const friend = await UserModel.findById(friendRequest.id)
      if (friend) {
        friendReqs.push(friend)
      }
    }

    return friendReqs
  }
}
