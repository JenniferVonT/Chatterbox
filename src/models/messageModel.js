/**
 * @file Defines the message model.
 * @module models/MessageModel
 * @author Mats Loock
 * @author Jennifer von Trotta-Treyden
 * @version 3.0.0
 */

import mongoose from 'mongoose'
import { BASE_SCHEMA } from './baseSchema.js'

const chatConnection = mongoose.createConnection(process.env.CHAT_DB)

// Create a schema.
const schema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true,
    unique: true
  },
  message: {
    type: String
  },
  user: [{
    type: String
  }]
})

schema.add(BASE_SCHEMA)
schema.index({ createdAt: 1 }, { expireAfterSeconds: 1_209_600 }) // Expire after 2 weeks.

// Create a model using the schema.
export const MessageModel = chatConnection.model('Message', schema)
