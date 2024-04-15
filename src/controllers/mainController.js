/**
 * @file Defines the mainController class.
 * @module controllers/HomeController
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

/**
 * Encapsulates the main controller.
 */
export class MainController {
  /**
   * Renders the start view when logged in.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async start (req, res, next) {
    res.render('main/index')
  }
}
