/**
 * @file Defines the user model.
 * @module models/UserModel
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import validator from 'validator'
import { BASE_SCHEMA } from './baseSchema.js'

const { isEmail } = validator

// Create a schema.
const schema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required.'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password is required.'],
    minLength: [10, 'The password must be of minimum length 10 characters.'],
    maxLength: [256, 'The password must be of maximum length 256 characters.']
  },
  email: {
    type: String,
    required: [true, 'Email address is required.'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [isEmail, 'Please provide a valid email address.']
  },
  resetCode: {
    type: String,
    unique: true
  }
})

schema.add(BASE_SCHEMA)

// Salts and hashes password before save.
schema.pre('save', async function () {
  this.password = await bcrypt.hash(this.password, 10)
})

/**
 * Authenticates a user.
 *
 * @param {string} username - The username.
 * @param {string} password - The password.
 * @returns {Promise<UserModel>} A promise that resolves with the user if authentication was successful.
 */
schema.statics.authenticate = async function (username, password) {
  const userDocument = await this.findOne({ username })

  // If no user found or password is wrong, throw an error.
  if (!userDocument || !(await bcrypt.compare(password, userDocument?.password))) {
    throw new Error('Invalid credentials.')
  }

  // User found and password correct, return the user.
  return userDocument
}

// Create a model using the schema.
export const UserModel = mongoose.model('User', schema)
