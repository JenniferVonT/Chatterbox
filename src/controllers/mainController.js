/**
 * @file Defines the mainController class.
 * @module controllers/mainController
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

import { UserModel } from '../models/userModel.js'

/**
 * Encapsulates the main controller.
 */
export class MainController {
  /**
   * Provide req.user to the route if :id is present.
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
      req.user = account

      // Next middleware.
      next()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Renders the start view when logged in.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async start (req, res, next) {
    res.render('main/index')
  }

  /**
   * Renders the settings view when logged in.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async settings (req, res, next) {
    res.locals.view = 'settings'
    res.render('main/settings')
  }

  /**
   * Renders the group view when logged in.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async groups (req, res, next) {
    res.render('main/groups')
  }
}
