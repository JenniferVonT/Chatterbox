# &lt;chat-app&gt;

A web component representing a chat window where you chat with a random student.

## Custom Events

### `voiceCall`

Called when a user clicks the button with the phone logo:

- details: `chatID`

![voiceBtn]('./img/voiceBtn.png')

### `videoCall`

Called when a user clicks the button with the camcorder:

- details: `chatID`

![videoBtn]('./img/videoBtn.png')


## WebSocket Configuration

This project communicates with a WebSocket server for real time updates.

### WebSocket Server Address

The WebSocket connections are established with the following server address where the :id defines the unique chat ID:

`wss://cscloud6-191.lnu.se/chatterbox/:id`
