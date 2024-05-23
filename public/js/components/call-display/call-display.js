/**
 * A simple component to view a call coming in.
 *
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

import styles from './call-display.css.js'

const template = document.createElement('template')
template.innerHTML = `
<style>
  ${styles}
</style>
<div id="call-display-content">
  <h1><b id=username></b> is calling!</h1>

  <div id="submit-btns">
    <button id="phoneCall" class="submit-button-user"><img src="./img/telephone-icon.svg" alt="Call">ACCEPT</button>
    <button id="videoCall" class="submit-button-user"><img src="./img/videocall-icon.svg" alt="Video">ACCEPT</button>
    <button id="denyCall">DENY</button>
  </div>

</div>
`
customElements.define('call-display',
  /**
   * Represents a call-display element.
   */
  class extends HTMLElement {
    /**
     * Represents the accept audio button.
     */
    #acceptAudio

    /**
     * Represents the accept video button.
     */
    #acceptVideo

    /**
     * Represents the deny call button.
     */
    #denyCall

    /**
     * Represents the tone that is played when the notification is present.
     */
    #ringingAudio

    /**
     * Creates an instance of the current type.
     */
    constructor () {
      super()

      this.attachShadow({ mode: 'open' })
        .appendChild(template.content.cloneNode(true))

      this.username = ''
      this.userID = ''
      this.callType = ''
      this.#acceptAudio = this.shadowRoot.querySelector('#phoneCall')
      this.#acceptVideo = this.shadowRoot.querySelector('#videoCall')
      this.#denyCall = this.shadowRoot.querySelector('#denyCall')

      // Create audio element.
      this.#ringingAudio = new Audio('./sound/call-tone.mp3')
      this.#ringingAudio.loop = true
    }

    /**
     * Called when the element is inserted into the DOM.
     */
    connectedCallback () {
      this.#acceptAudio.addEventListener('click', () => this.#handleCall('audio'))
      this.#acceptVideo.addEventListener('click', () => this.#handleCall('video'))
      this.#denyCall.addEventListener('click', () => this.#handleCall('denied'))

      // Plays the audio.
      this.#ringingAudio.play()
    }

    /**
     * Called when the element is removed from the DOM.
     */
    disconnectedCallback () {
      // Stop the audio.
      this.#ringingAudio.pause()
      this.#ringingAudio.currentTime = 0
    }

    /**
     * Handles when the call is either accepted or denied.
     *
     * @param {string} type - The type of call, audio, video or denied.
     */
    #handleCall (type) {
      if (type === 'audio') {
        this.dispatchEvent(new CustomEvent('audioCallAccepted', {
          bubbles: true,
          composed: true,
          detail: { caller: this.username, callerID: this.userID }
        }))
      } else if (type === 'video') {
        this.dispatchEvent(new CustomEvent('videoCallAccepted', {
          bubbles: true,
          composed: true,
          detail: { caller: this.username, callerID: this.userID }
        }))
      } else {
        this.dispatchEvent(new CustomEvent('callDenied', {
          bubbles: true,
          composed: true
        }))
      }
    }

    /**
     * Set the call type to either 'audio' or 'video'.
     *
     * @param {string} callType - The call type.
     */
    setCallType (callType) {
      if (callType === 'audio') {
        this.callType = 'audio'
      }

      if (callType === 'video') {
        this.callType = 'video'
      }
    }

    /**
     * Sets the caller up.
     *
     * @param {string} username - the username of the caller.
     * @param {string} userID - the id of the caller.
     */
    setCaller (username, userID) {
      this.username = username
      this.userID = userID

      this.#insertUser()
    }

    /**
     * Inserts the user data into the component.
     */
    #insertUser () {
      const user = this.shadowRoot.querySelector('#username')

      user.textContent = this.username
    }
  }
)
