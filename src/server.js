/**
 * @file Defines the main application.
 * @module app
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

import httpContext from 'express-http-context' // Must be first!
import express from 'express'
import expressLayouts from 'express-ejs-layouts'
import session from 'express-session'
import helmet from 'helmet'
import { randomUUID } from 'node:crypto'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { connectToDatabase } from './config/mongoose.js'
import { morganLogger } from './config/morgan.js'
import { sessionOptions } from './config/sessionOptions.js'
import { logger } from './config/winston.js'
import { wss } from './config/webSocketServer.js'
import { router } from './routes/router.js'
import { FriendBuilder } from './lib/buildFriends.js'
import { UserModel } from './models/userModel.js'
const friendBuilder = new FriendBuilder()

try {
  // Connect to MongoDB.
  await connectToDatabase(process.env.USER_DB)

  // Creates an Express application.
  const app = express()

  // Get the directory name of this module's path.
  const directoryFullName = dirname(fileURLToPath(import.meta.url))

  // Set the base URL to use for all relative URLs in a document.
  const baseURL = process.env.BASE_URL || '/'

  // View engine setup.
  app.set('view engine', 'ejs')
  app.set('views', join(directoryFullName, 'views'))
  app.set('layout', join(directoryFullName, 'views', 'layouts', 'default'))
  app.set('layout extractScripts', true)
  app.set('layout extractStyles', true)
  app.use(expressLayouts)

  // Parse requests of the content type application/x-www-form-urlencoded.
  // Populates the request object with a body object (req.body).
  app.use(express.urlencoded({ extended: false }))

  // Set various HTTP headers to make the application a little more secure (https://www.npmjs.com/package/helmet).
  app.use(helmet())

  // Populates the request object with a body object (req.body).
  app.use(express.json())

  // Serve static files.
  app.use(express.static(join(directoryFullName, '..', 'public')))
  app.use(express.static(join(directoryFullName, '..', 'publicImages'), { maxAge: '604800' })) // 1 week.

  // Setup and use session middleware (https://github.com/expressjs/session)
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1) // trust first proxy
  }
  app.use(session(sessionOptions))

  // Add the request-scoped context.
  // NOTE! Must be placed before any middle that needs access to the context!
  //       See https://www.npmjs.com/package/express-http-context.
  app.use(httpContext.middleware)

  // Use a morgan logger.
  app.use(morganLogger)

  // Middleware to be executed before the routes.
  app.use(async (req, res, next) => {
    // Add a request UUID to each request and store information about
    // each request in the request-scoped context.
    req.requestUuid = randomUUID()
    httpContext.set('request', req)

    // Create a nonce to send with each request in order to run inline style rules of custom components despite the CSP.
    const nonce = 'brdS0E4VftZB/fVvwQYczJwsdsspXTLV0EV5DRnxwtE=' // dynamically create a nonce, but wont work when inserting into components as of yet: crypto.randomBytes(32).toString('base64')

    // Set the CSP header for the application.
    res.setHeader(
      'Content-Security-Policy',
      `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'nonce-${nonce}'; style-src-elem 'self' 'nonce-${nonce}'; style-src-attr 'self' 'nonce-${nonce}'; connect-src 'self' https://emoji-api.com wss://cscloud6-191.lnu.se/chatterbox/ ws://localhost:9696/; img-src 'self' data:; font-src 'self' data:;`
    )

    // Flash messages - survives only a round trip.
    if (req.session.flash) {
      res.locals.flash = req.session.flash
      delete req.session.flash
    }

    if (req.session.user) {
      const user = await UserModel.findById(req.session.user.id)
      // Build the friend and friendReq list.
      res.locals.user = req.session.user

      res.locals.view = ''
      res.locals.user.friends = await friendBuilder.getFriendsList(user)
      res.locals.user.friendReqs = await friendBuilder.getFriendReqList(user)
    } else {
      res.locals.user = false
    }

    // Pass the base URL to the views and the neccessary variables.
    res.locals.baseURL = baseURL
    res.locals.resetCode = false
    res.locals.nonce = nonce

    // Pass the WebSocket server to the response object.
    res.wss = wss

    next()
  })

  // Register routes.
  app.use('/', router)

  // Error handler.
  app.use((err, req, res, next) => {
    // 404 Not Found.
    if (err.status === 404) {
      res
        .status(404)
        .sendFile(join(directoryFullName, 'views', 'errors', '404.html'))
      return
    }

    // 500 Internal Server Error (in production, all other errors send this response).
    if (process.env.NODE_ENV !== 'development') {
      res
        .status(500)
        .sendFile(join(directoryFullName, 'views', 'errors', '500.html'))
      return
    }

    // ---------------------------------------------------
    // ⚠️ WARNING: Development Environment Only!
    //             Detailed error information is provided.
    // ---------------------------------------------------

    // Render the error page.
    res
      .status(err.status || 500)
      .render('errors/error', { error: err })
  })

  // Starts the HTTP server listening for connections.
  const server = app.listen(process.env.PORT, () => {
    logger.info(`Server running at http://localhost:${server.address().port}`)
    logger.info('Press Ctrl-C to terminate...')
  })

  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (socket) => {
      wss.emit('connection', socket, request)
    })
  })
} catch (err) {
  logger.error(err.message, { error: err })
  process.exitCode = 1
}
