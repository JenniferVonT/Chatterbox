/**
 * @file Defines the user router.
 * @module userRouter
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

import express from 'express'
import { UserController } from '../controllers/userController.js'

export const router = express.Router()

const controller = new UserController()

router.get('/', (req, res, next) => controller.login(req, res, next))
router.post('/login', (req, res, next) => controller.loginUser(req, res, next))

router.get('/signup', (req, res, next) => controller.signup(req, res, next))
router.post('/signup', (req, res, next) => controller.signupUser(req, res, next))

router.get('/reclaim', (req, res, next) => controller.reclaim(req, res, next))
router.post('/reclaim', (req, res, next) => controller.reclaimUser(req, res, next))
router.post('/reclaim/reset', (req, res, next) => controller.resetUser(req, res, next))

router.post('logout', (req, res, next) => controller.logout(req, res, next))
