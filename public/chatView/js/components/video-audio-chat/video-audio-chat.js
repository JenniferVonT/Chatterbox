/**
 * A component that represents a video/audio chat box.
 *
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.1.0
 */

import styles from './video-audio-chat.css.js'

const template = document.createElement('template')
template.innerHTML = `
<style nonce="brdS0E4VftZB/fVvwQYczJwsdsspXTLV0EV5DRnxwtE=">
  ${styles}
</style>

<div id="wrapper">
  <div id="placeholder">Audio</div>
  <video id="incomingVideo" class="hidden" autoplay playsinline></video>
  <video id="outgoingVideo" class="hidden" autoplay playsinline muted></video>
  <button id="endCallBtn">End Call</button>
  <button id="activateCameraBtn"><img src="./chatView/img/videocall-icon.svg" alt="Video">Activate Camera</button>
  <button id="deactivateCameraBtn" class="hidden"><img src="./chatView/img/videocall-icon.svg" alt="Video">Camera Off</button>
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
    #mediaConstraints = { video: false, audio: true }

    /**
     * Represents the end call button.
     */
    #endCallBtn

    /**
     * Represents the button that activates the camera.
     */
    #activateCameraBtn

    /**
     * Represents the button that de-activates the camera.
     */
    #deactivateCameraBtn

    /**
     * Represents a queue for the ice-candidate signals.
     */
    #iceCandidatesQueue

    /**
     * Represents if the remote description is set or not.
     */
    #remoteDescriptionSet

    /**
     * The RTC connection offer.
     */
    #offer

    /**
     * The current users id.
     */
    #userID

    /**
     * Creates an instance of the current type.
     */
    constructor () {
      super()

      // Attach a shadow DOM tree to this element.
      this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true))

      // Initialize private fields.
      this.#chatID = this.getAttribute('chatID')
      this.#activateCameraBtn = this.shadowRoot.querySelector('#activateCameraBtn')
      this.#deactivateCameraBtn = this.shadowRoot.querySelector('#deactivateCameraBtn')
      this.#iceCandidatesQueue = []
      this.#remoteDescriptionSet = false
      this.#peerConnection = undefined
      this.#offer = undefined
      this.#userID = this.getAttribute('userID')

      // Create a WebSocket connection.
      // this.#socket = new WebSocket(`ws://localhost:9696/${this.#chatID}/${this.#userID}`) /* USE WHEN WORKING LOCALLY */
      this.#socket = new WebSocket(`wss://cscloud6-191.lnu.se/chatterbox/${this.#chatID}/${this.#userID}`)

      /*
      this.#socket.addEventListener('open', (event) => console.log('WebSocket connection opened:', event))
      this.#socket.addEventListener('close', (event) => console.log('WebSocket connection closed:', event))
      this.#socket.addEventListener('error', (event) => console.error('WebSocket encountered an error:', event))
      */

      this.#socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data)
        this.#handleSignal(data)
      })

      // Bind the end call button event.
      this.#endCallBtn = this.shadowRoot.querySelector('#endCallBtn')
      this.#endCallBtn.addEventListener('click', () => this.#sendEndCall())

      this.#activateCameraBtn.addEventListener('click', () => this.#activateCamera())
      this.#deactivateCameraBtn.addEventListener('click', () => this.#deactivateCamera())
    }

    /**
     * Called when the element is inserted into the DOM.
     */
    connectedCallback () {
      // Start the local stream.
      this.#retryLocalStream()
    }

    /**
     * Called when the element is removed from the DOM.
     */
    disconnectedCallback () {
      this.#sendEndCall()
      this.#peerConnection.close()
      this.stopStreams()
      this.shadowRoot.querySelector('#incomingVideo').srcObject = null
      this.shadowRoot.querySelector('#outgoingVideo').srcObject = null
      this.#socket.close()
    }

    /**
     * Starts the stream with only audio.
     */
    async #startLocalStream () {
      try {
        this.#localStream = await navigator.mediaDevices.getUserMedia(this.#mediaConstraints)

        // Ensure audio stream is available
        if (!this.#localStream.getAudioTracks()) {
          throw new Error('Audio stream not available.')
        }

        const outgoingVideo = this.shadowRoot.querySelector('#outgoingVideo')
        outgoingVideo.srcObject = this.#localStream

        this.#startCall()
      } catch (error) {
        console.error('Error accessing media devices.', error)
      }
    }

    /**
     * Initialize the webbRTC connection and start the call.
     */
    async #startCall () {
      try {
        this.#initializePeerConnection()

        // Add the tracks to the peer connection
        if (this.#localStream) {
          this.#localStream.getTracks().forEach(track => {
            this.#peerConnection.addTrack(track, this.#localStream)
          })
        }

        // Create an offer with just audio.
        this.#offer = await this.#peerConnection.createOffer()

        await this.#peerConnection.setLocalDescription(this.#offer)

        // Send the offer to the peer.
        this.#sendSignal({ type: 'offer', key: this.#chatID, offer: this.#offer })
      } catch (error) {
        console.error('Error accessing media devices or starting the call:', error)
      }
    }

    /**
     * Handle incoming messages.
     *
     * @param {JSON} data - The incoming event object.
     */
    async #handleSignal (data) {
      try {
        if (!this.#peerConnection) {
          this.#initializePeerConnection()
        }

        switch (data.type) {
          case 'offer':
            if (this.#peerConnection.signalingState === 'stable' || this.#peerConnection.signalingState === 'have-local-offer') {
              await this.#peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer))
              const answer = await this.#peerConnection.createAnswer()

              await this.#peerConnection.setLocalDescription(answer)

              // Send a signal with the answer.
              this.#sendSignal({ type: 'answer', key: this.#chatID, answer })

              this.#remoteDescriptionSet = true

              // Process any queued ICE candidates.
              this.#iceCandidatesQueue.forEach(async candidate => {
                await this.#peerConnection.addIceCandidate(candidate).catch(e => {
                  console.error('Error adding queued ICE candidate', e)
                })
              })
              this.#iceCandidatesQueue = []
            }
            break

          case 'answer':
            if (this.#peerConnection.signalingState === 'have-local-offer') {
              await this.#peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer))
              this.#remoteDescriptionSet = true

              // Process any queued ICE candidates.
              this.#iceCandidatesQueue.forEach(async candidate => {
                await this.#peerConnection.addIceCandidate(candidate).catch(e => {
                  console.error('Error adding queued ICE candidate', e)
                })
              })
              this.#iceCandidatesQueue = []
            }
            break

          case 'ice-candidate':
            if (data.candidate) {
              const candidate = new RTCIceCandidate(data.candidate)

              if (this.#remoteDescriptionSet) {
                await this.#peerConnection.addIceCandidate(candidate).catch(e => {
                  console.error('Error adding received ICE candidate', e)
                })
              } else {
                this.#iceCandidatesQueue.push(candidate)
              }
            }
            break

          case 'deactivateCamera':
            if (data.userID !== this.getAttribute('user')) {
              // Update UI on the receiving end when sender deactivates camera.
              const incomingVideo = this.shadowRoot.querySelector('#incomingVideo')
              const placeholder = this.shadowRoot.querySelector('#placeholder')
              incomingVideo.classList.add('hidden')
              placeholder.classList.remove('hidden')

              // Remove video tracks.
              this.#remoteStream.getVideoTracks().forEach(track => {
                track.stop()
                this.#remoteStream.removeTrack(track)
              })
            }
            break

          case 'activateCamera':
            if (data.userID !== this.getAttribute('user')) {
              // Update UI on the receiving end when sender reactivates camera.
              const incomingVideo = this.shadowRoot.querySelector('#incomingVideo')
              const placeholder = this.shadowRoot.querySelector('#placeholder')
              incomingVideo.classList.remove('hidden')
              placeholder.classList.add('hidden')

              // Set the remote description and handle video feed.
              await this.#peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer))
              const answer = await this.#peerConnection.createAnswer()
              await this.#peerConnection.setLocalDescription(answer)

              // Send answer back to peer.
              this.#sendSignal({ type: 'answer', key: this.#chatID, answer })
            }
            break

          case 'endCall':
            this.dispatchEvent(new CustomEvent('endCall', {
              bubbles: true,
              composed: true
            }))
            break
        }
      } catch (error) {
        console.error('Error handling signal:', error)
      }
    }

    /**
     * Activates the camera by sending a signal to the other user and establishing a video stream via the websocket.
     */
    async #activateCamera () {
      try {
        // Get the audio and video stream.
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true })

        // Add the tracks to the peer connection.
        videoStream.getTracks().forEach(track => {
          this.#peerConnection.addTrack(track, this.#localStream)
        })

        this.#localStream = new MediaStream([...this.#localStream.getAudioTracks(), ...videoStream.getVideoTracks()])

        // Renegotiate the connection with the new offer.
        const offer = await this.#peerConnection.createOffer()
        await this.#peerConnection.setLocalDescription(offer)

        // Send a signaln to the peer letting them know a camera feed is coming.
        this.#sendSignal({ type: 'activateCamera', key: this.#chatID, userID: this.#userID, offer })

        // Update the UI to show the outgoing video stream.
        const outgoingVideo = this.shadowRoot.querySelector('#outgoingVideo')
        outgoingVideo.srcObject = this.#localStream
        outgoingVideo.classList.remove('hidden')

        this.#activateCameraBtn.classList.add('hidden')
        this.#deactivateCameraBtn.classList.remove('hidden')
      } catch (error) {
        console.error('Error accessing media devices or activating camera:', error)
      }
    }

    /**
     * Deactivates the camera.
     */
    async #deactivateCamera () {
      try {
        const videoTracks = this.#localStream.getVideoTracks()

        // Stop all the video tracks to turn off the camera.
        videoTracks.forEach(track => {
          track.stop() // This turns off the camera.
          this.#localStream.removeTrack(track)
        })

        // Re-create the local stream with only audio.
        this.#localStream = new MediaStream(this.#localStream.getAudioTracks())

        // Renegotiate RTC connection.
        const offer = await this.#peerConnection.createOffer()
        await this.#peerConnection.setLocalDescription(offer)

        // Send the new offer to the peer.
        this.#sendSignal({ type: 'deactivateCamera', key: this.#chatID, userID: this.#userID, offer })

        // Update the UI to hide the outgoing video stream.
        const outgoingVideo = this.shadowRoot.querySelector('#outgoingVideo')
        outgoingVideo.classList.add('hidden')
        outgoingVideo.srcObject = null

        this.#activateCameraBtn.classList.remove('hidden')
        this.#deactivateCameraBtn.classList.add('hidden')
      } catch (error) {
        console.error('Error deactivating camera.', error)
      }
    }

    /**
     * Initialize the WebRTC peer connection.
     */
    async #initializePeerConnection () {
      this.#peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        sdpSemantics: 'unified-plan'
      })

      /**
       * Set up ice-candidate.
       *
       * @param {Event} event - the event object.
       */
      this.#peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.#sendSignal({ type: 'ice-candidate', key: this.#chatID, candidate: event.candidate })
        }
      }

      /**
       * Set up the incomingVideo.
       *
       * @param {Event} event - the event object.
       */
      this.#peerConnection.ontrack = (event) => {
        const incomingVideo = this.shadowRoot.querySelector('#incomingVideo')
        const placeholder = this.shadowRoot.querySelector('#placeholder')

        if (!this.#remoteStream) {
          this.#remoteStream = new MediaStream()
          incomingVideo.srcObject = this.#remoteStream
          // console.log('Created new remote stream and set it to incomingVideo.')
        }

        // Add the received track to the remote stream.
        this.#remoteStream.addTrack(event.track)
        // console.log('Added track to remote stream:', event.track)

        // If the incoming track is a video track, update the UI accordingly.
        if (event.track.kind === 'video') {
          incomingVideo.classList.remove('hidden')
          placeholder.classList.add('hidden')
          // console.log('Video track received and UI updated.')
        }
      }

      this.#peerConnection.addEventListener('negotiationneeded', async () => {
        try {
          // Create a new offer for the updated connection (audio + video).
          const offer = await this.#peerConnection.createOffer()
          await this.#peerConnection.setLocalDescription(offer)
        } catch (error) {
          console.error('Error during renegotiation:', error)
        }
      })
    }

    /**
     * Send signaling data through the WebSocket connection.
     *
     * @param {JSON} data - the data object to send.
     */
    #sendSignal (data) {
      // Try 15 times, if it is successfull exit/return the method.
      for (let i = 0; i < 15; i++) {
        if (this.#socket.readyState === WebSocket.OPEN) {
          this.#socket.send(JSON.stringify(data))
          return
        }
      }
    }

    /**
     * Stop all media tracks.
     */
    stopStreams () {
      if (this.#localStream) {
        this.#localStream.getTracks().forEach(track => track.stop())
      }
      if (this.#remoteStream) {
        this.#remoteStream.getTracks().forEach(track => track.stop())
      }
    }

    /**
     * Send an endCall signal though the Websocket connection.
     */
    #sendEndCall () {
      const message = {
        type: 'endCall',
        key: this.#chatID
      }

      // Send a signal to the other user to close down the call.
      this.#sendSignal(message)
    }

    /**
     * If the connection fails, retries again.
     *
     * @param {number} retries - Number of times to retry.
     */
    async #retryLocalStream (retries = 3) {
      for (let i = 0; i < retries; i++) {
        try {
          await this.#startLocalStream()
          // console.log('Successfully started local stream on try: ', i + 1)
          return
        } catch (error) {
          console.error('Error starting local stream. Retry:', i + 1, error)
          await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second before retrying.
        }
      }
      console.error('Failed to start local stream after retries.')
    }
  }
)
