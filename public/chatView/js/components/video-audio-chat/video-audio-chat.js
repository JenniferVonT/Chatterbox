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
    #mediaConstraints = {
      incoming: { video: false, audio: true },
      outgoing: { video: false, audio: true }
    }

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

      // Create a WebSocket connection.
      // this.#socket = new WebSocket(`ws://localhost:9696/${this.#chatID}`) /* USE WHEN WORKING LOCALLY */
      this.#socket = new WebSocket(`wss://cscloud6-191.lnu.se/chatterbox/${this.#chatID}`)

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

      // Start the local stream.
      this.#startLocalStream()
    }

    /**
     * Called when the element is removed from the DOM.
     */
    disconnectedCallback () {
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
        this.#localStream = await navigator.mediaDevices.getUserMedia(this.#mediaConstraints.outgoing)
        const outgoingVideo = this.shadowRoot.querySelector('#outgoingVideo')
        if (this.#mediaConstraints.outgoing.video) {
          outgoingVideo.srcObject = this.#localStream
        }
        this.#startCall()
      } catch (error) {
        console.error('Error accessing media devices.', error)
      }
    }

    /**
     * Initialize the webbRTC connection and start the call.
     */
    async #startCall () {
      this.#initializePeerConnection()
      this.#localStream.getTracks().forEach(track => this.#peerConnection.addTrack(track, this.#localStream))

      const offer = await this.#peerConnection.createOffer()

      await this.#peerConnection.setLocalDescription(offer)
      this.#sendSignal({ type: 'offer', key: this.#chatID, offer })
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
              this.#sendSignal({ type: 'answer', key: this.#chatID, answer })
              this.#remoteDescriptionSet = true
              // Process any queued ICE candidates
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
              // Process any queued ICE candidates
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
              // Update UI on the receiving end when sender deactivates camera
              const incomingVideo = this.shadowRoot.querySelector('#incomingVideo')
              const placeholder = this.shadowRoot.querySelector('#placeholder')
              incomingVideo.classList.add('hidden')
              placeholder.classList.remove('hidden')
              // Remove video tracks
              this.#remoteStream.getVideoTracks().forEach(track => {
                this.#remoteStream.removeTrack(track)
                track.stop()
              })
            }
            break

          case 'activateCamera':
            if (data.userID !== this.getAttribute('user')) {
              // Update UI on the receiving end when sender reactivates camera
              const incomingVideo = this.shadowRoot.querySelector('#incomingVideo')
              const placeholder = this.shadowRoot.querySelector('#placeholder')
              incomingVideo.classList.remove('hidden')
              placeholder.classList.add('hidden')
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
     * Activates the camera byt sending a signal to the other user and establishing a video stream via the websocket.
     */
    async #activateCamera () {
      try {
        // Get a new local media stream with video enabled
        const newVideoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })

        // Update UI to show outgoing video stream
        const outgoingVideo = this.shadowRoot.querySelector('#outgoingVideo')
        outgoingVideo.srcObject = newVideoStream
        outgoingVideo.classList.remove('hidden')
        this.#activateCameraBtn.classList.add('hidden')
        this.#deactivateCameraBtn.classList.remove('hidden')
        this.#mediaConstraints.outgoing.video = true

        // Add the new video tracks to the peer connection and remove the previous video tracks
        this.#localStream.getVideoTracks().forEach(track => {
          this.#peerConnection.removeTrack(this.#peerConnection.getSenders().find(sender => sender.track === track))
          track.stop() // Stop the previous video tracks
        })
        newVideoStream.getTracks().forEach(track => {
          this.#peerConnection.addTrack(track, newVideoStream) // Add the new video tracks
        })

        // Create an offer and set local description
        const offer = await this.#peerConnection.createOffer()
        await this.#peerConnection.setLocalDescription(offer)

        // Send offer to the other peer
        this.#sendSignal({ type: 'offer', key: this.#chatID, offer })
      } catch (error) {
        console.error('Error accessing media devices or activating camera:', error)
      }
    }

    /**
     * Deactivates the camera.
     */
    async #deactivateCamera () {
      try {
        // Stop the video tracks in the local stream.
        this.#localStream.getVideoTracks().forEach(track => track.stop())

        // Update the media constraints
        this.#mediaConstraints.outgoing.video = false

        // Update the UI
        const outgoingVideo = this.shadowRoot.querySelector('#outgoingVideo')
        outgoingVideo.classList.add('hidden')
        this.#activateCameraBtn.classList.remove('hidden')
        this.#deactivateCameraBtn.classList.add('hidden')

        // Remove video tracks from the peer connection
        this.#peerConnection.getSenders().forEach(sender => {
          if (sender.track && sender.track.kind === 'video') {
            this.#peerConnection.removeTrack(sender)
          }
        })

        // Signal the change to the remote peer
        const offer = await this.#peerConnection.createOffer()
        await this.#peerConnection.setLocalDescription(offer)
        this.#sendSignal({ type: 'deactivateCamera', key: this.#chatID, userID: this.getAttribute('user'), offer })
      } catch (error) {
        console.error('Error deactivating camera.', error)
      }
    }

    /**
     * Initialize the WebRTC peer connection.
     */
    #initializePeerConnection () {
      this.#peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
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
        }
        this.#remoteStream.addTrack(event.track)

        // If the incoming track is a video track, update the UI accordingly
        if (event.track.kind === 'video') {
          incomingVideo.classList.remove('hidden')
          placeholder.classList.add('hidden')
        }
      }
    }

    /**
     * Send signaling data through the WebSocket connection.
     *
     * @param {JSON} data - the data object to send.
     */
    #sendSignal (data) {
      this.#socket.send(JSON.stringify(data))
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
  }
)
