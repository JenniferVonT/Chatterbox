/**
 * @file This module contains the options object for the session middleware.
 * @module sessionOptions
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

// Options object for the session middleware.
export const sessionOptions = {
  name: process.env.SESSION_NAME, // Don't use default session cookie name.
  secret: process.env.SESSION_SECRET, // The secret is used to hash the session with HMAC.
  resave: false, // Resave even if a request is not changing the session.
  saveUninitialized: false, // Don't save a created but not modified session.
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    sameSite: 'strict' // To prevent the requests to be sent from different sites (for ex. CSRF attacks)
  }
}

if (process.env.NODE_ENV === 'production') {
  sessionOptions.cookie.secure = true // serve secure cookies
}
