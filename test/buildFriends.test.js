/**
 * Automatic testing for the buildFriends module.
 */

import dotenv from 'dotenv'
import { FriendBuilder } from '../src/lib/buildFriends'
import { connectToDatabase, disconnectFromDatabase } from '../src/config/mongoose.js'

const builder = new FriendBuilder()
const getFriends = builder.getFriendsList.bind(builder)
const getFriendRequests = builder.getFriendReqList.bind(builder)

const TEST_USER = {
  friends: [
    { id: '6643bdc91794b4dd3eade002', chatId: 'Mlip6553FYhZuuqpivkzw1AOv7roaabXPBOIG71isXO43C63aT' },
    { id: '6643caf339750700c783ab6a', chatId: 'ZZKx2jintk2RX04qTtwyXX9glIBJ0rWuoB2raUF8JY91q75gGi' },
    { id: '665a3065d4be61cf7fdbf55b', chatId: 'jd1eljrZI6JF5NjX6hnmqyisPJl06M3cpDjgUPCvLfKKMwfPaI' }
  ],
  friendReqs: [
    { id: '6643bdc91794b4dd3eade002' },
    { id: '6643caf339750700c783ab6a' }
  ]
}

// Open the Mongo database before making the tests and then close when done.
dotenv.config() // load the environment variables.

beforeAll(async () => {
  await connectToDatabase(process.env.USER_DB)
})

afterAll(async () => {
  await disconnectFromDatabase()
})

/**
 * Tests if the returned friendlist contains the correct properties.
 *
 * @param {Function} func - The function to test.
 * @param {object} testUser - A test object that mimics a user.
 */
async function expectedToBeFriendList (func, testUser) {
  const friends = await func(testUser)

  for (const friend of friends) {
    // Test the friend object that it includes all the necessary properties.
    expect(friend)
      .toHaveProperty('id')
      .toHaveProperty('username')
      .toHaveProperty('profileImg')
      .toHaveProperty('chatID')
  }
}

/**
 * Tests if the returned friend requests list contains the correct properties.
 *
 * @param {Function} func - The function to test.
 * @param {object} testUser - A test object that mimics a user.
 */
async function expectedToBeFriendReqs (func, testUser) {
  const requests = await func(testUser)

  for (const req of requests) {
    // Test the request object that it includes all the necessary properties.
    expect(req).toHaveProperty('id')
    expect(req).toHaveProperty('username')
    expect(req).toHaveProperty('profileImg')
  }
}

/**
 * Testing if the return type is an array.
 *
 * @param {Function} func - The function to test.
 * @param {object} testUser - A test object that mimics a user.
 */
async function expectedReturnType (func, testUser) {
  const functionReturn = await func(testUser)

  expect(Array.isArray(functionReturn)).toBe(true)
}

// Run all the tests.
describe('Friend list', () => {
  describe('Test return type', () => {
    it('Should return an array', async () => {
      await expectedReturnType(getFriends, TEST_USER)
    })
  })

  describe('Test return object', () => {
    it('Should return an array of objects with the properties: id, username, profileImg and chatID', async () => {
      await expectedToBeFriendList(getFriends, TEST_USER)
    })
  })
})

describe('Friend request list', () => {
  describe('Test return type', () => {
    it('Should return an array', async () => {
      await expectedReturnType(getFriendRequests, TEST_USER)
    })
  })

  describe('Test return object', () => {
    it('Should return an array of objects with the properties: id, username and profileImg', async () => {
      await expectedToBeFriendReqs(getFriendRequests, TEST_USER)
    })
  })
})
