/**
 * @file Defines the main router when the user is logged in.
 * @module mainRouter
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

import { FriendController } from '../controllers/friendController.js'
import express from 'express'

export const router = express.Router()

const controller = new FriendController()

// Provide req.user to the route if :id is present in the route path.
router.param('id', (req, res, next, user) => controller.loadFriend(req, res, next, user))

router.get('/', (req, res, next) => controller.friends(req, res, next))

router.post('/add/:id', (req, res, next) => controller.add(req, res, next))
router.post('/remove/:id', (req, res, next) => controller.remove(req, res, next))
