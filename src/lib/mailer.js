/**
 * @file Defines the mailer.
 * @module lib/mailer
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

import nodemailer from 'nodemailer'
import { logger } from '../config/winston.js'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 587, // Set to 587 in production
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PWD
  }
})

/**
 * The main transfer method to send a mail.
 *
 * @param {object} user - the user object containing the email, username and unique reset code.
 */
export async function transfer (user) {
  try {
    // send mail with defined transport object
    await transporter.sendMail({
      from: process.env.EMAIL, // sender address
      to: user.email, // Reciever
      subject: 'Reclaim account', // Subject line
      text: 'Hello world?', // plain text body
      html: '<b>Hello world?</b>' // html body
    })

    logger.silly(`Email sent to user: ${user.username}`)
  } catch (err) {
    throw new Error('Email failed to send')
  }
}
