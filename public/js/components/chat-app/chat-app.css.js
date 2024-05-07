const chatAppStyles = `
#wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: 'Courier New', Courier, monospace;
    font-weight: bold;
    width: 450px;
    height: 480px;
}

#chatWindow {
    width: 430px;
    height: 340px;
    margin-left: 10px;
    margin-right: 10px;
    margin-top: 10px;
    margin-bottom: 15px;
    background-color: white;
    overflow-y: auto;
    border: 1px solid black;
}

p {
    margin: 10px;
    margin-top: 20px;
    word-wrap: break-word;
    white-space: pre-line;
    background-color: #d6d6d6;
}

#message {
    font-size: 18px;
    width: 425px;
    height: 50px;
    margin-left: 10px;
    resize: none;
}

#showUser {
    text-align: center;
    background-color: white;
    border: 1px dotted black;
    margin-left: 10px;
}

#send {
    margin-left: 10px;
}

#emojiButton {
    margin-left: 10px;
}

#connect {
    margin-left: 180px;
    padding: 10px;
}

h1, 
#showUser {
    text-align: center;
    margin-top: 50px;
}

.emojiBtn {
    width: 45px;
    height: 25px;
    text-align: center;
    justify-content: center;
    border: none;
    background-color: white;
}

.emojiBtn:hover {
    background-color: #c4e0f7;
}

#emojiDropdown {
    display: flex;
    flex-wrap: wrap;
    max-width: 300px;
    height: 150px;
    background-color: white;
    overflow-y: auto;
    overflow-x: hidden;
    border: 1px solid black;
}

.hidden {
    display: none;
}

#emojiDropdown.hidden {
    display: none;
}
`

export default chatAppStyles
