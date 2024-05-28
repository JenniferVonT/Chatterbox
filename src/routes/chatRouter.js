/**
 * @file Defines the main router when the user is logged in.
 * @module chatRouter
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

import { ChatController } from '../controllers/chatController.js'
import express from 'express'

export const router = express.Router()

const controller = new ChatController()

// Recieve the user objects for the chat.
router.param('id', (req, res, next, user) => controller.loadUsers(req, res, next, user))

router.get('/video/:id', (req, res, next) => controller.video(req, res, next))

router.get('/:id', (req, res, next) => controller.chat(req, res, next))
