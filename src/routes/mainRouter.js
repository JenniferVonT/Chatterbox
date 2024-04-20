/**
 * @file Defines the main router when the user is logged in.
 * @module mainRouter
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

import express from 'express'
import { MainController } from '../controllers/mainController.js'

export const router = express.Router()

const controller = new MainController()

// Provide req.user to the route if :id is present in the route path.
router.param('id', (req, res, next, user) => controller.loadAccount(req, res, next, user))

router.get('/', (req, res, next) => controller.start(req, res, next))
router.get('/settings/:id', (req, res, next) => controller.settings(req, res, next))
router.get('/friends/:id', (req, res, next) => controller.friends(req, res, next))
router.get('/groups/:id', (req, res, next) => controller.groups(req, res, next))
