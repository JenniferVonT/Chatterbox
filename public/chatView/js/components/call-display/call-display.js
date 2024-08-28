/**
 * A simple component to view a call coming in.
 *
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

import styles from './call-display.css.js'

const template = document.createElement('template')
template.innerHTML = `
<style nonce="brdS0E4VftZB/fVvwQYczJwsdsspXTLV0EV5DRnxwtE=">
  ${styles}
</style>
<div id="call-display-content">
  <h1><b id=username></b> is calling!</h1>

  <div id="submit-btns">
    <button id="phoneCall" class="submit-button-user"><img src="./chatView/img/telephone-icon.svg" alt="Call">ACCEPT</button>
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
      this.#acceptAudio = this.shadowRoot.querySelector('#phoneCall')
      this.#denyCall = this.shadowRoot.querySelector('#denyCall')

      // Create audio element.
      this.#ringingAudio = new Audio('./chatView/sound/call-tone.mp3')
      this.#ringingAudio.loop = true
    }

    /**
     * Called when the element is inserted into the DOM.
     */
    connectedCallback () {
      this.#acceptAudio.addEventListener('click', () => this.#handleCall('accept'))
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
     * @param {string} type - If the call is denied.
     */
    #handleCall (type) {
      if (type === 'accept') {
        this.dispatchEvent(new CustomEvent('callAccepted', {
          bubbles: true,
          composed: true,
          detail: { caller: this.username, callerID: this.userID }
        }))
      }

      if (type === 'denied') {
        this.dispatchEvent(new CustomEvent('callDenied', {
          bubbles: true,
          composed: true
        }))
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
