/**
 * @file Defines the main router when the user is logged in.
 * @module mainRouter
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

import express from 'express'
import { MainController } from '../controllers/mainController.js'
import { router as friendRouter } from './friendRouter.js'
import { router as chatRouter } from './chatRouter.js'

export const router = express.Router()

const controller = new MainController()

router.get('/', (req, res, next) => controller.start(req, res, next))

router.get('/settings', (req, res, next) => controller.settings(req, res, next))
router.get('/groups', (req, res, next) => controller.groups(req, res, next))

router.use('/friends', friendRouter)
router.use('/chat', chatRouter)
