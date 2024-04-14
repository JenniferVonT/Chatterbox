/**
 * @file Defines the main router.
 * @module routes/router
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

import express from 'express'
import http from 'node:http'
import { router as userRouter } from './userRouter.js'

export const router = express.Router()

router.use('/', userRouter)

// Catch 404 (ALWAYS keep this as the last route).
router.use('*', (req, res, next) => {
    const statusCode = 404
    const error = new Error(http.STATUS_CODES[statusCode])
    error.status = statusCode
    next(error)
  })
  