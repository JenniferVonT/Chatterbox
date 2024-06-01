# &lt;chat-app&gt;

A web component representing a chat window where you chat with a random student.

## Methods

### `sendConfirmation()`

Sends a confirmation to the other user via the websocket if the audio call is accepted or denied.

#### payload

The message being sent to the other user have this syntax:

```javascript
message = {
  type: 'confirmation' || 'deniedCall',
  key: chatID
}
```

## Custom Events

### `calling`

Happens a user is being called (the other user has clicked the phone button):

![voiceBtn](./img/voiceBtn.png)

```javascript
detail = {
  caller: callers username,
  callerID: callers id,
  chatID: the chats id
}
```

### `confirmation`

Called when the user that you call has accepted it.

```javascript
detail = {
  caller: callerID,
  receiver: theCalledUserID
}
```

## WebSocket Configuration

This project communicates with a WebSocket server for real time updates.

### WebSocket Server Address

The WebSocket connections are established with the following server address where the :id defines the unique chat ID:

`wss://cscloud6-191.lnu.se/chatterbox/:id`
