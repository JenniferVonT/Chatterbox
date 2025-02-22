/**
 * @file Defines the friend router when the user is logged in.
 * @module friendRouter
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
router.post('/', (req, res, next) => controller.searchUsers(req, res, next))

router.post('/friendReq/:id', (req, res, next) => controller.sendFriendRequest(req, res, next))
router.post('/add/:id', (req, res, next) => controller.add(req, res, next))
router.post('/deny/:id', (req, res, next) => controller.deny(req, res, next))
router.post('/remove/:id', (req, res, next) => controller.remove(req, res, next))
