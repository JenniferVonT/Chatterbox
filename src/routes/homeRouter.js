/**
 * @file Defines the home router.
 * @module homeRouter
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

import express from 'express'
import { HomeController } from '../controllers/homeController.js'

export const router = express.Router()

const controller = new HomeController()

router.get('/', (req, res, next) => controller.login(req, res, next))
