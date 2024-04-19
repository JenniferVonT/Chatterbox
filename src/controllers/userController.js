/**
 * @file Defines the userController class.
 * @module controllers/HomeController
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

import { UserModel } from '../models/userModel.js'
import bcrypt from 'bcrypt'
import randomize from 'randomatic'
import { transfer } from '../lib/mailer.js'

/**
 * Encapsulates a controller.
 */
export class UserController {
  /**
   * Renders a view and sends the rendered HTML string as an HTTP response.
   * index GET.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async login (req, res, next) {
    res.render('home/login')
  }

  /**
   * Handles when a user logs in.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async loginUser (req, res, next) {
    try {
      const { username, password } = req.body
      const user = await UserModel.findOne({ username })

      if (!user) {
        const error = new Error('The username and/or password is incorrect.')
        error.status = 404
        throw error
      }

      // Compare the entered password with the stored password.
      const passwordMatch = await bcrypt.compare(password, user.password)

      if (!passwordMatch) {
        const error = new Error('The username and/or password is incorrect.')
        error.status = 401 // Unauthorized
        throw error
      }

      // Set the user in the session.
      req.session.user = user

      // Redirect.
      res.redirect('./start')
    } catch (error) {
      req.session.flash = { type: 'danger', text: error.message }
      res.redirect('./')
    }
  }

  /**
   * Renders the signup page.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async signup (req, res, next) {
    res.render('home/signup')
  }

  /**
   * Handles the user signup.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async signupUser (req, res, next) {
    try {
      const { username, password, password2, email } = req.body

      // Validate if they wrote the same password twice.
      if (password !== password2) {
        const error = new Error('The password has to match!')
        error.status = 400
        throw error
      }

      await UserModel.create({
        username,
        password,
        email
      })

      req.session.flash = { type: 'success', text: 'The account was created successfully. Please login to continue' }
      res.redirect('./')
    } catch (error) {
      if (error.code === 11000 && error.message.includes('email')) {
        req.session.flash = { type: 'danger', text: 'That email is already in use.' }
        res.redirect('./signup')
      } else if (error.code === 11000) {
        req.session.flash = { type: 'danger', text: 'That username is already in use.' }
        res.redirect('./signup')
      } else {
        req.session.flash = { type: 'danger', text: error.message }
        res.redirect('./signup')
      }
    }
  }

  /**
   * Renders the reclaim account page.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async reclaim (req, res, next) {
    res.render('home/reclaim')
  }

  /**
   * Handles when a user tries to reclaim a account.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async reclaimUser (req, res, next) {
    try {
    // Find user.
      const { email } = req.body
      const user = await UserModel.findOne({ email })

      // If the user doesn't exist throw an error.
      if (!user) {
        const error = new Error('User not found')
        error.code = 400
        throw error
      }

      // Create a random reset code and save in the users DB.
      const resetCode = randomize('Aa0', 6)

      // Save the resetCode to the user doc in the db.
      user.resetCode = resetCode

      // Save only the updated field,
      await user.save({ validateBeforeSave: false })

      // Send an email to the user.
      await transfer(user)

      res.locals.flash = { type: 'success', text: 'If the account exists a reset code has been sent to the given email' }
      res.locals.resetCode = true
      res.render('home/reclaim')
    } catch (error) {
      // Makes sure that the same message is sent to the client no matter if the user exists or not.
      if (error.message === 'User not found') {
        res.locals.flash = { type: 'success', text: 'If the account exists a reset code has been sent to the given email' }
        res.locals.resetCode = true
        res.render('home/reclaim')
      }
      next(error)
    }
  }

  /**
   * Handles when a user sends in their resetCode.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async resetUser (req, res, next) {
    // Insert method when the user sends in the reset code recieved in the email.
  }

  /**
   * Handles when a user tries to logout from an account.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async logout (req, res, next) {
    // CODE HERE.
  }
}
