/**
 * A component that represents a video/audio chat box.
 *
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.1.0
 */

import styles from './video-audio-chat.css.js'

const template = document.createElement('template')
template.innerHTML = `
<style>
  ${styles}
</style>

<div id="wrapper">
  <div id="placeholder" class="placeholder">Audio only</div>
  <video id="incomingVideo" autoplay playsinline></video>
  <video id="outgoingVideo" autoplay playsinline muted></video>
  <button id="endCallBtn" class="submit-button-user">End Call</button>
</div>
`

customElements.define('video-audio-chat',
  /**
   * Represents a video-audio-chat element.
   */
  class extends HTMLElement {
    /**
     * Represents a websocket connection.
     */
    #socket

    /**
     * Represents the chats unique ID.
     */
    #chatID

    /**
     * Represents the RTCPeerConnection.
     */
    #peerConnection

    /**
     * Represents the local media stream.
     */
    #localStream

    /**
     * Represents the remote media stream.
     */
    #remoteStream

    /**
     * Represents the media constraints.
     */
    #mediaConstraints

    /**
     * Creates an instance of the current type.
     */
    constructor () {
      super()

      // Attach a shadow DOM tree to this element.
      this.attachShadow({ mode: 'open' })
        .appendChild(template.content.cloneNode(true))

      this.#chatID = this.getAttribute('chatID')

      // Create a websocket and put the appropriate event listeners.
      // this.#socket = new WebSocket(`wss://cscloud6-191.lnu.se/chatterbox/${this.#chatID}`)
      // USE THIS WHEN WORKING LOCALLY:
      this.#socket = new WebSocket(`ws://localhost:9696/${this.#chatID}`)

      this.#socket.addEventListener('open', (event) => {
        console.log('WebSocket connection opened:', event)
      })

      this.#socket.addEventListener('close', (event) => {
        console.log('WebSocket connection closed:', event)
      })

      this.#socket.addEventListener('error', (event) => {
        console.error('WebSocket encountered an error:', event)
      })

      this.#socket.addEventListener('message', this.#handleSignal.bind(this))

      // Bind the end call button event
      this.shadowRoot.getElementById('endCallBtn').addEventListener('click', this.#endCall.bind(this))
    }

    /**
     * Called when the element is inserted into the DOM.
     */
    connectedCallback () {
      // Start local stream based on the set constraints.
      if (this.#mediaConstraints) {
        this.#startLocalStream()
      }
    }

    /**
     * Sets the type of chat. Video/audio or just audio.
     *
     * @param {string} type - the type: 'video' or 'audio'.
     */
    setType (type) {
      const incomingVideo = this.shadowRoot.getElementById('incomingVideo')
      const outgoingVideo = this.shadowRoot.getElementById('outgoingVideo')
      const placeholder = this.shadowRoot.getElementById('placeholder')

      if (type === 'video') {
        this.#mediaConstraints = { video: true, audio: true }
        incomingVideo.style.display = 'block'
        outgoingVideo.style.display = 'block'
        placeholder.style.display = 'none'
      } else if (type === 'audio') {
        this.#mediaConstraints = { video: false, audio: true }
        incomingVideo.style.display = 'none'
        outgoingVideo.style.display = 'none'
        placeholder.style.display = 'block'
      } else {
        throw new Error('Invalid chat type. Use "video" or "audio".')
      }
    }

    /**
     * Initialize local media stream.
     */
    async #startLocalStream () {
      try {
        this.#localStream = await navigator.mediaDevices.getUserMedia(this.#mediaConstraints)
        const outgoingVideo = this.shadowRoot.getElementById('outgoingVideo')
        outgoingVideo.srcObject = this.#localStream

        this.#startCall()
      } catch (error) {
        console.error('Error accessing media devices.', error)
      }
    }

    /**
     * Initialize WebRTC connection and start the call.
     */
    async #startCall () {
      this.#peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      })

      /**
       * Handles the peer connection.
       *
       * @param {Event} event - the event object.
       */
      this.#peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.#sendSignal({
            type: 'ice-candidate',
            candidate: event.candidate
          })
        }
      }

      /**
       * Handles the peer connection.
       *
       * @param {Event} event - the event object.
       */
      this.#peerConnection.ontrack = (event) => {
        const incomingVideo = this.shadowRoot.getElementById('incomingVideo')
        if (!this.#remoteStream) {
          this.#remoteStream = new MediaStream()
          incomingVideo.srcObject = this.#remoteStream
        }
        this.#remoteStream.addTrack(event.track)
      }

      this.#localStream.getTracks().forEach(track => {
        this.#peerConnection.addTrack(track, this.#localStream)
      })

      const offer = await this.#peerConnection.createOffer()
      await this.#peerConnection.setLocalDescription(offer)
      this.#sendSignal({
        type: 'offer',
        offer
      })
    }

    /**
     * Handle incoming WebSocket signaling messages.
     *
     * @param {MessageEvent} event - The event object.
     */
    async #handleSignal (event) {
      const data = JSON.parse(event.data)
      if (data.type === 'offer') {
        await this.#peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer))
        const answer = await this.#peerConnection.createAnswer()
        await this.#peerConnection.setLocalDescription(answer)
        this.#sendSignal({
          type: 'answer',
          answer
        })
      } else if (data.type === 'answer') {
        await this.#peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer))
      } else if (data.type === 'ice-candidate') {
        if (data.candidate) {
          await this.#peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
        }
      }
    }

    /**
     * Send a signaling message through the WebSocket.
     *
     * @param {object} message - The message being sent.
     */
    #sendSignal (message) {
      message.key = this.#chatID
      this.#socket.send(JSON.stringify(message))
    }

    /**
     * End the call and clean up resources.
     */
    #endCall () {
      this.#peerConnection.close()
      this.#localStream.getTracks().forEach(track => track.stop())
      this.shadowRoot.getElementById('incomingVideo').srcObject = null
      this.shadowRoot.getElementById('outgoingVideo').srcObject = null
      this.#socket.close()
    }
  }
)
