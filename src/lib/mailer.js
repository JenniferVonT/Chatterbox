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
  port: 587,
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
      text: `Hello!\n
            Your reset code is: ${user.resetCode.code}\n
            If it wasn't you who requested an account reset ignore this email.\n
            Do not share this code as it is used to reset your account, it only has a one time use and expires in 30min.`,
      html: `<b>Hello, ${user.username}!</b><br>
            <p>Your reset code is: <b>${user.resetCode.code}</b></p><br>
            <i>If it wasn't you who requested an account reset ignore this email.</i><br>
            <i>Do not share this code as it is used to reset your account, it only has a one time use and expires in 30min.</i>`
    })

    logger.silly(`Email sent to user: ${user.username}`)
  } catch (err) {
    throw new Error('Email failed to send')
  }
}
