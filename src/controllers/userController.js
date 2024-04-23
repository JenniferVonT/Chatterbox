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

      const user = await UserModel.authenticate(username, password)

      // Set the user in the session.
      req.session.user = user

      // Redirect.
      res.redirect('./main')
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
      let { username, password, password2, email } = req.body

      // Validate if they wrote the same password twice.
      if (password !== password2) {
        const error = new Error('The password has to match!')
        error.status = 400
        throw error
      }

      // Check the length of the password.
      if (password.length < 10 || password.length > 256) {
        const error = new Error('Password length must be between 10 and 256 characters')
        error.status = 400
        throw error
      }

      // Hash and salt the password before creating a user in the DB.
      password = await bcrypt.hash(password, 10)

      await UserModel.create({
        username,
        password,
        email,
        profileImg: 'profile1.jpg'
      })

      req.session.flash = { type: 'success', text: 'The account was created successfully. Please login to continue' }
      res.redirect('./')
    } catch (error) {
      if (error.code === 11000 && error.message.includes('email')) {
        res.locals.flash = { type: 'danger', text: 'That email is already in use.' }
        res.render('home/signup')
      }
      if (error.code === 11000) {
        res.locals.flash = { type: 'danger', text: 'That username is already in use.' }
        res.render('home/signup')
      }
      if (error.message.includes('email')) {
        res.locals.flash = { type: 'danger', text: 'Please provide a valid email adress.' }
        res.render('home/signup')
      } else {
        res.locals.flash = { type: 'danger', text: error.message }
        res.render('home/signup')
      }
      next(error)
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

  /**
   * Handles when a user updates their profile image.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async updateImg (req, res, next) {
    try {
      const body = req.body
      const image = body.image
      const id = req.session.user

      // Find the user and insert the profile img URI.
      const user = await UserModel.findOne({ id })

      // If the user doesn't exist throw an error.
      if (!user) {
        const error = new Error('User not found')
        error.code = 400
        throw error
      }

      user.profileImg = image

      // Save the updated user.
      await user.save({ validateBeforeSave: false })

      req.session.flash = { type: 'success', text: 'Your profile image was successfully updated!' }
      res.redirect('./')
    } catch (error) {
      req.session.flash = { type: 'danger', text: error.message }
      res.redirect('./')
    }
  }

  /**
   * Handles when a user updates their email.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async updateEmail (req, res, next) {
    try {
      // Get the required variables from the req body.
      const { password, oldEmail, newEmail } = req.body
      const username = req.session.user.username

      const user = await UserModel.authenticate(username, password)

      // Check if the password matches.
      if (!user) {
        const error = new Error('Wrong password!')
        error.code = 400
        throw error
      }

      // Check if the old email matches the saved one.
      if (user.email !== oldEmail) {
        const error = new Error('The old email does not match!')
        error.code = 400
        throw error
      }

      // If all is fine save the new email to the user.
      user.email = newEmail

      await user.save({ validateBeforeSave: false })

      req.session.flash = { type: 'success', text: 'Your email was successfully updated!' }
      res.redirect('./main/settings')
    } catch (error) {
      req.session.flash = { type: 'danger', text: error.message }
      res.redirect('./main/settings')
    }
  }
}
