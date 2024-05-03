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
  async loadAccount (req, res, next, user) {
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
      res.render('main/friends', { viewData: {} })
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

      const viewData = { results: searchResult.map(result => result.toObject()) }

      res.render('main/friends', { viewData })
    } catch (error) {

    }
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
}
