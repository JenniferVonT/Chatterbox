/**
 * @file Defines a builder for the friend-lists.
 * @module lib/FriendBuilder
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

import { UserModel } from '../models/userModel.js'

/**
 * Represents a builder for the friend and friendReq lists.
 */
export class FriendBuilder {
  /**
   * Gets the friend requests that is located within the session user,
   * creates an object containing the user objects of the requests.
   *
   * @param {object} sessionUser - The current session user.
   * @returns {object[]} - An array containing user objects.
   */
  async getFriendReqList (sessionUser) {
    // Load the friend requests for the session user
    const friendReqs = []
    for (const friendRequest of sessionUser.friendReqs) {
      const friend = await UserModel.findById(
        friendRequest.id,
        { username: 1, id: 1, profileImg: 1 })

      if (friend) {
        friendReqs.push(friend)
      }
    }

    return friendReqs
  }

  /**
   * Gets the friend requests that is located within the session user,
   * creates an object containing the user objects of the requests.
   *
   * @param {object} sessionUser - The current session user.
   * @returns {object[]} - An array containing user objects.
   */
  async getFriendsList (sessionUser) {
    // Load the userModels for the session user
    const friends = []
    const user = await UserModel.findById(sessionUser.id)

    for (const friend of user.friends) {
      const friendModel = await UserModel.findById(friend.userId)

      if (friendModel) {
        const friendObj = {
          id: friendModel.id,
          username: friendModel.username,
          profileImg: friendModel.profileImg,
          chatID: friend.chatId
        }

        friends.push(friendObj)
      }
    }

    return friends
  }
}
