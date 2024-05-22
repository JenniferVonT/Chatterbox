/**
 * A component that represents a chat box.
 *
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.1.0
 */

import chatAppStyles from './chat-app.css.js'

const template = document.createElement('template')
template.innerHTML = `
<style>
${chatAppStyles}
</style>
<div id="wrapper">
    <form id="chat" method="POST">
        <div id="chatWindow"></div>

        <textarea id="message" name="message" rows="10" cols="50" placeholder="Write your message here!" autocomplete="off"></textarea>
  
        <div id="submit-btns">
          <div class="hidden" id="emojiDropdown"></div>
          <button type="submit" id="send" class="submit-button-user">Send</button>
          <button id="emojiButton" class="submit-button-user">😊</button>
          <button id="phoneCall" class="submit-button-user"><img src="./img/telephone-icon.svg" alt="Call"></button>
          <button id="videoCall" class="submit-button-user"><img src="./img/videocall-icon.svg" alt="Video"></button>
        </div> 
    </form>
</div>
`

customElements.define('chat-app',
  /**
   * Represents a chat-app element.
   */
  class extends HTMLElement {
    /**
     * Represents the username.
     */
    #username

    /**
     * Represents the window that shows the chat conversation.
     */
    #chatWindow

    /**
     * Represents the message input.
     */
    #message

    /**
     * Represents the chat form.
     */
    #sendMessage

    /**
     * Represents the latest received message from the server/other user.
     */
    #recievedMessage

    /**
     * Represents the last 20 messages both sent and recieved
     */
    #conversation

    /**
     * The unique ID for this chat conversation.
     */
    #chatID

    /**
     * Represents the websocket.
     */
    #socket

    /**
     * Represents the encryptionKey.
     */
    #encryptionKey

    /**
     * Represents the initializations vector for the encryption.
     */
    #initV

    /**
     * Represents the video chat button.
     */
    #videoBtn

    /**
     * Represents the phone chat button.
     */
    #phoneBtn

    /**
     * Creates an instance of the current type.
     */
    constructor () {
      super()

      // Attach a shadow DOM tree to this element.
      this.attachShadow({ mode: 'open' })
        .appendChild(template.content.cloneNode(true))

      this.#chatWindow = this.shadowRoot.querySelector('#chatWindow')
      this.#message = this.shadowRoot.querySelector('#message')
      this.#sendMessage = this.shadowRoot.querySelector('#chat')
      this.#recievedMessage = ''
      this.#conversation = []
      this.#username = ''
      this.#encryptionKey = ''
      this.#initV = window.crypto.getRandomValues(new Uint8Array(16))
      this.#phoneBtn = this.shadowRoot.querySelector('#phoneCall')
      this.#videoBtn = this.shadowRoot.querySelector('#videoCall')
      this.#chatID = this.getAttribute('chatID')
      this.emojiDropdown = this.shadowRoot.querySelector('#emojiDropdown')
      this.emojiButton = this.shadowRoot.querySelector('#emojiButton')

      // Create a websocket and put the appropriate event listeners.
      // this.#socket = new WebSocket(`wss://cscloud6-191.lnu.se/chatterbox/${this.#chatID}`)
      // USE THIS WHEN WORKING LOCALLY:
      this.#socket = new WebSocket(`ws://localhost:9696/${this.#chatID}`)

      /*
      this.#socket.addEventListener('open', (event) => {
        console.log('WebSocket connection opened:', event)
      })
      */

      this.#socket.addEventListener('message', (event) => {
        this.#recievedMessage = JSON.parse(event.data)

        this.#handleRecievedMessages(this.#recievedMessage)
      })

      /*
      this.#socket.addEventListener('close', (event) => {
        console.log('WebSocket connection closed:', event)
      })

      this.#socket.addEventListener('error', (event) => {
        console.error('WebSocket encountered an error:', event)
      })
      */

      this.#message.addEventListener('keydown', (event) => this.#handleKeyDown(event))
      this.#sendMessage.addEventListener('submit', (event) => this.#sendMessages(event))
      this.emojiButton.addEventListener('click', (event) => this.#toggleEmojiDropdown(event, 'on'))
      this.emojiButton.addEventListener('blur', (event) => this.#toggleEmojiDropdown(event, 'off'))

      this.#buildEmojiList()
    }

    /**
     * Called when the element is inserted into the DOM.
     */
    connectedCallback () {
      this.#username = this.getAttribute('user')

      this.#phoneBtn.addEventListener('click', () => {
        const message = {
          type: 'call',
          callType: 'audio',
          caller: this.#username,
          callerID: this.getAttribute('userID'),
          key: this.#chatID
        }
        this.#socket.send(JSON.stringify(message))
      })

      this.#videoBtn.addEventListener('click', () => {
        const message = {
          type: 'call',
          callType: 'video',
          caller: this.#username,
          callerID: this.getAttribute('userID'),
          key: this.#chatID
        }
        this.#socket.send(JSON.stringify(message))
      })
    }

    /**
     * Called when the element is removed from the DOM.
     */
    disconnectedCallback () {
      this.#socket.close()
    }

    /**
     * Called when an attribute is changed.
     *
     * @param {string} name - the name of the attribute to check.
     */
    attributeChangedCallback (name) {
      if (name === 'user') {
        this.#username = name
      }

      if (name === 'chatID') {
        this.#chatID = name
      }
    }

    /**
     * Handles the event when the 'enter' key is clicked.
     *
     * @param {Event} event - keydown event.
     */
    #handleKeyDown (event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        this.#sendMessages(event)
      }
    }

    /**
     * Sends the submitted message to the server.
     *
     * @param {Event} event - The submit event.
     */
    async #sendMessages (event) {
      event.preventDefault()

      const encryptedMessage = await this.#encryptMessage(this.#message.value.toString())

      // Convert the message to base64 in order to send it over the socket.
      const base64message = btoa(String.fromCharCode.apply(null, new Uint8Array(encryptedMessage)))

      if (this.#message.value !== '') {
        const messageToSend = {
          type: 'message',
          data: base64message,
          user: `${this.getAttribute('userID')}`,
          iv: this.#initV,
          key: this.#chatID
        }

        this.#socket.send(JSON.stringify(messageToSend))

        this.#message.value = ''
      }
    }

    /**
     * Handles all the recieved messages from the server.
     *
     * @param {object} message - a parsed JSON object.
     */
    async #handleRecievedMessages (message) {
      let username = ''

      try {
        if (message.type === 'message') {
          if (message.user === this.getAttribute('userID')) {
            username = this.#username
          } else if (message.user === this.getAttribute('secondUserID')) {
            username = this.getAttribute('secondUser')
          }

          const decryptedMessage = await this.#decryptMessage(message)

          const userMessage = {
            username,
            message: decryptedMessage
          }

          this.#conversation.unshift(userMessage)

          this.#conversation = this.#conversation.slice(0, 30)

          this.#renderMessages()
        } else if (message.type === 'call') {
          if (message.caller !== this.getAttribute('user')) {
            this.dispatchEvent(new CustomEvent(`${message.callType}Call`, {
              bubbles: true,
              composed: true,
              detail: { caller: message.caller, callerID: message.callerID, chatID: message.key }
            }))
          }
        } else if (message.type === 'confirmation') {
          console.log(message)
        } else if (message.type !== 'heartbeat') {
          this.#handleConversation(message)
        }
      } catch (error) {
        console.error('Could not receive message: ', error)
      }
    }

    /**
     * Renders the conversation in the chat window.
     */
    #renderMessages () {
      // Check if the scrollbar should scroll to the bottom.
      const shouldScrollToBottom = this.#chatWindow.scrollTop + this.#chatWindow.clientHeight === this.#chatWindow.scrollHeight

      this.#chatWindow.innerHTML = ''
      const length = this.#conversation.length

      for (let i = 0; i < length; i++) {
        const div = document.createElement('div')
        const username = document.createElement('h4')
        const message = document.createElement('p')
        const profileImg = document.createElement('img')
        profileImg.setAttribute('alt', 'profileIMG')

        username.textContent = this.#conversation[i].username

        // Check which user the message is tied to and insert the correct img.
        if (username.textContent === this.getAttribute('user')) {
          const profileIMG = this.getAttribute('userImg')
          profileImg.setAttribute('src', `./img/profiles/${profileIMG}`)
        } else {
          const profileIMG = this.getAttribute('secondUserImg')
          profileImg.setAttribute('src', `./img/profiles/${profileIMG}`)
        }
        username.prepend(profileImg)

        message.textContent = this.#conversation[i].message

        div.append(username)
        div.append(message)

        div.classList.add('chat-messages')

        this.#chatWindow.prepend(div)
      }

      if (shouldScrollToBottom) {
        this.#chatWindow.scrollTop = this.#chatWindow.scrollHeight
      }
    }

    /**
     * Renders the entire conversation.
     *
     * @param {object} messages - a parsed JSON object.
     */
    async #handleConversation (messages) {
      // Get the encryption key from the server.
      const key = messages.encryptionKey

      const decodedKey = Uint8Array.from(atob(key), c => c.charCodeAt(0))

      // Convert the Uint8Array encryption key to a CryptoKey
      this.#encryptionKey = await window.crypto.subtle.importKey(
        'raw',
        decodedKey,
        { name: 'AES-CBC' },
        false,
        ['encrypt', 'decrypt']
      )

      for (const message of messages.messages) {
        let username = ''

        if (message.user === this.getAttribute('userID')) {
          username = this.#username
        } else if (message.user === this.getAttribute('secondUserID')) {
          username = this.getAttribute('secondUser')
        }

        const decryptedMessage = await this.#decryptMessage(message)

        const userMessage = {
          username,
          message: decryptedMessage
        }

        this.#conversation.unshift(userMessage)
      }
      this.#renderMessages()
    }

    /**
     * Decrypts the outgoing message.
     *
     * @param {object} message - A message object.
     * @returns {string} - The decrypted message.
     */
    async #decryptMessage (message) {
      try {
        // Convert message to an ArrayBuffer.
        const encryptedData = Uint8Array.from(atob(message.data), c => c.charCodeAt(0))

        // Parse the IV from JSON format to Uint8Array
        const ivValues = Object.values(message.iv)
        const ivUint8Array = new Uint8Array(ivValues)

        // Convert the Uint8Array to ArrayBuffer
        const ivArrayBuffer = ivUint8Array.buffer

        // Decrypt the message.
        const decryptedArrayBuffer = await window.crypto.subtle.decrypt(
          {
            name: 'AES-CBC',
            iv: ivArrayBuffer
          },
          this.#encryptionKey,
          encryptedData
        )

        // Convert to a string and return.
        return new TextDecoder().decode(decryptedArrayBuffer)
      } catch (error) {
        // If an error occurs during decryption.
        console.error('Decryption failed:', error.message)
      }
    }

    /**
     * Encrypts the incoming message.
     *
     * @param {string} message - The message.
     * @returns {Buffer} - The encrypted message.
     */
    async #encryptMessage (message) {
      try {
        // Prepare the message.
        const plaintextMsg = new TextEncoder().encode(message)

        // Encrypt the message.
        const encryptedMsg = await window.crypto.subtle.encrypt(
          {
            name: 'AES-CBC',
            iv: this.#initV
          },
          this.#encryptionKey,
          plaintextMsg
        )

        return encryptedMsg
      } catch (error) {
        console.error('Could not encrypt: ', error.message)
      }
    }

    /**
     * Toggles the dropdown menu of the emoji list and adds all the emojis.
     *
     * @param {Event} event - the click event.
     * @param {string} onOrOff - is it on (showing) or off (hidden).
     */
    async #toggleEmojiDropdown (event, onOrOff) {
      event.preventDefault()

      if (onOrOff === 'on') {
        this.emojiDropdown.classList.remove('hidden')
      } else {
        this.emojiDropdown.classList.add('hidden')
      }
    }

    /**
     * Builds the emoji list.
     */
    async #buildEmojiList () {
      // Fetch all the emojis.
      const response = await fetch('https://emoji-api.com/emojis?access_key=69ecede85d728684b87d72b52e59f63c696b4e66')
      const emojis = await response.json()

      // Create a button out of every emoji and insert them when clicked.
      emojis.forEach((emoji) => {
        const emojiButton = document.createElement('button')
        emojiButton.classList.add('emojiBtn')
        emojiButton.innerHTML = emoji.character

        emojiButton.addEventListener('mousedown', (event) => {
          // Disable propagation as to not trigger the eventlistener that sends the message.
          event.stopPropagation()
          this.#message.value += emoji.character

          // Push the focus last in the call stack to regain focus to the textarea.
          setTimeout(() => {
            this.#message.focus()
          }, 0)
        })

        this.emojiDropdown.append(emojiButton)
      })
    }

    /**
     * Sends a confirmation to the other user.
     *
     * @param {string} type - send confirmation to the other user, audio, video or denied.
     */
    sendConfirmation (type) {
      const message = {
        type: 'confirmation',
        caller: this.getAttribute('secondUser'),
        callerID: this.getAttribute('secondUserID'),
        state: type
      }
      this.#socket.send(JSON.stringify(message))
    }
  })
