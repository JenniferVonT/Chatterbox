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

// Check if there is already a user logged in to the session.
router.get('/', (req, res, next) => {
  if (req.session.user) {
    res.redirect('./main')
  } else {
    next()
  }
})

// Provide user data to req.doc to the route if :id is present in the route path.
router.param('id', (req, res, next, id) => controller.loadUserDocument(req, res, next, id))

router.get('/', (req, res, next) => controller.login(req, res, next))
router.post('/login', (req, res, next) => controller.loginUser(req, res, next))

router.get('/signup', (req, res, next) => controller.signup(req, res, next))
router.post('/signup', (req, res, next) => controller.signupUser(req, res, next))

router.get('/reclaim', (req, res, next) => controller.reclaim(req, res, next))
router.post('/reclaim', (req, res, next) => controller.reclaimUser(req, res, next))
router.post('/reclaim/reset', (req, res, next) => controller.resetUser(req, res, next))

router.post('/logout', (req, res, next) => controller.logout(req, res, next))

// Changes made in the settings view.
router.post('/changeProfileImg', (req, res, next) => controller.updateImg(req, res, next))
// router.post('/updatePassword/:id', (req, res, next) => controller.updatePassword(req, res, next))
// router.post('/updateEmail/:id', (req, res, next) => controller.updateEmail(req, res, next))
// router.post('/deleteAcc/:id', (req, res, next) => controller.deleteAcc(req, res, next))
