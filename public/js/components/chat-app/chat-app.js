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
          <button type="submit" id="send" class="submit-button-user">Send</button>
          <button id="emojiButton" class="submit-button-user">😊</button>
        </div> 
        <div class="hidden" id="emojiDropdown"></div>
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
      this.emojiDropdown = this.shadowRoot.querySelector('#emojiDropdown')
      this.emojiButton = this.shadowRoot.querySelector('#emojiButton')

      // Create a websocket and put the appropriate event listeners.
      const HOST = 'ws://localhost:9696'

      this.#socket = new WebSocket(HOST)

      this.#socket.addEventListener('open', (event) => {
        console.log('WebSocket connection opened:', event)
      })

      this.#socket.addEventListener('message', (event) => {
        this.#recievedMessage = JSON.parse(event.data)
        console.log('Recieved message:', this.#recievedMessage)

        this.#handleRecievedMessages(this.#recievedMessage)
      })

      this.#socket.addEventListener('close', (event) => {
        console.log('WebSocket connection closed:', event)
      })

      this.#socket.addEventListener('error', (event) => {
        console.error('WebSocket encountered an error:', event)
      })

      this.#message.addEventListener('keydown', (event) => this.#handleKeyDown(event))
      this.#sendMessage.addEventListener('submit', (event) => this.#sendMessages(event))
      this.emojiButton.addEventListener('click', (event) => this.#toggleEmojiDropdown(event, 'on'))
      this.emojiButton.addEventListener('blur', (event) => this.#toggleEmojiDropdown(event, 'off'))

      // this.#buildEmojiList()
    }

    /**
     * Called when the element is inserted into the DOM.
     */
    connectedCallback () {
      this.#chatID = this.getAttribute('chatID')
      this.#username = this.getAttribute('user')

      this.#renderConversation()
    }

    /**
     * Called when the element is removed from the DOM.
     */
    disconnectedCallback () {
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
    #sendMessages (event) {
      event.preventDefault()

      if (this.#message.value !== '') {
        const messageToSend = {
          type: 'message',
          data: `${this.#message.value.toString()}`,
          user: `${this.getAttribute('userID')}`,
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
    #handleRecievedMessages (message) {
      if (message.type === 'message') {
        const username = message.username
        const messageData = message.data

        const userMessage = {
          username,
          message: messageData
        }

        this.#conversation.unshift(userMessage)

        this.#conversation = this.#conversation.slice(0, 30)

        localStorage.setItem('chatlog', JSON.stringify(this.#conversation))

        this.#renderConversation()
      }
    }

    /**
     * Renders the conversation in the chat window.
     */
    #renderConversation () {
      // Check if the scrollbar should scroll to the bottom.
      const shouldScrollToBottom = this.#chatWindow.scrollTop + this.#chatWindow.clientHeight === this.#chatWindow.scrollHeight

      this.#chatWindow.innerHTML = ''
      const length = this.#conversation.length

      for (let i = 0; i < length; i++) {
        const pElement = document.createElement('p')

        const username = this.#conversation[i].username
        const message = this.#conversation[i].message
        const formattedMessage = `${username}:\n \u00A0 ${message}`

        pElement.textContent = formattedMessage

        this.#chatWindow.prepend(pElement)
      }

      if (shouldScrollToBottom) {
        this.#chatWindow.scrollTop = this.#chatWindow.scrollHeight
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
      const response = await fetch('https://emoji-api.com/emojis?access_key=48bf4f6218ef9c64ccb2929606657b42222f5d10')
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
  })
