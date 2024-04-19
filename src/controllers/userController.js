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

      // Hash and salt the password before creating a user in the DB.
      const hashedPassword = await bcrypt.hash(password, 10)

      await UserModel.create({
        username,
        hashedPassword,
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
    try {
      const { email, resetCode, password, password2 } = req.body

      // Validate if they wrote the same password twice.
      if (password !== password2) {
        const error = new Error('The password has to match!')
        error.status = 400
        throw error
      }

      // Check the length of the password.
      if (password.length < 10 || password.length > 256) {
        const error = new Error('Password length to short/long')
        error.status = 400
        throw error
      }

      // See if there is a user...
      const user = await UserModel.findOne({ email })

      if (!user) {
        const error = new Error('User not found')
        error.status = 404
        throw error
      }

      // ...and if the reset code match continue.
      if (!user.resetCode || user.resetCode !== resetCode) {
        const error = new Error('Reset code does not match!')
        error.status = 400
        throw error
      }

      // Save the new password and set the resetCode to false.
      user.password = await bcrypt.hash(password, 10)
      user.resetCode = undefined
      await user.save()

      req.session.flash = { type: 'success', text: 'The account was reset successfully. Please login to continue' }
      res.redirect('../')
    } catch (error) {
      // If the password has the wrong lenght.
      if (error.message === 'Password length to short/long') {
        res.locals.flash = {
          type: 'danger',
          text: 'The new password is to short or to long. It should be between 10-256 characters long!'
        }
        res.locals.resetCode = true
        res.render('home/reclaim')
      }

      // If the passwords does not match.
      if (error.message === 'The password has to match!') {
        res.locals.flash = {
          type: 'danger',
          text: 'The passwords no not match!'
        }
        res.locals.resetCode = true
        res.render('home/reclaim')
      }

      // If the user does not exist.
      if (error.message === 'User not found') {
        res.locals.flash = {
          type: 'danger',
          text: 'That email does not exist'
        }
        res.locals.resetCode = true
        res.render('home/reclaim')
      }

      // If the reset code does not match.
      if (error.message === 'Reset code does not match!') {
        res.locals.flash = {
          type: 'danger',
          text: 'The reset code does not match!'
        }
        res.locals.resetCode = true
        res.render('home/reclaim')
      }
      next(error)
    }
  }

  /**
   * Handles when a user tries to logout from an account.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async logout (req, res, next) {
    try {
      if (req.session.user) {
        // Remove the session.
        req.session.destroy()

        res.redirect('../')
      } else {
        // If a user is not active/logged in, throw a 404 error
        const error = new Error('Not Found')
        error.status = 404
        throw error
      }
    } catch (error) {
      next(error)
    }
  }
}
