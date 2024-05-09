const chatAppStyles = `
#wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: 'Courier New', Courier, monospace;
    font-weight: bold;
    width: 450px;
    height: 480px;
}

#chatWindow {
    width: 430px;
    height: 340px;
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
    width: 426px;
    height: 50px;
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

#emojiDropdown.hidden {
    display: none;
}

/*<-------------------------- SCROLL-BAR CUSTOMIZATION -------------------------->*/
/* Width */
::-webkit-scrollbar {
    width: 7px; /* width of the entire scrollbar */
}

/* Track */
::-webkit-scrollbar-track {
    background: #613659; /* color of the track */
    border-bottom-right-radius: 10px;
    border-bottom-left-radius: 10px;
}

/* Handle */
::-webkit-scrollbar-thumb {
    background: #211522; /* color of the scroll thumb */
    border-radius: 10px; /* roundness of the scroll thumb */
}

/* Firefox-specific styles */
@-moz-document url-prefix() {
    /* Track and handle styles for Firefox */
    * {
        scrollbar-color: #211522 #613659; /* thumb and track color */
        scrollbar-width: thin; /* width of the scrollbar */
    }

    *::-moz-scrollbar-thumb {
        background: #211522; /* color of the scroll thumb */
        border-radius: 10px; /* roundness of the scroll thumb */
    }

    *::-moz-scrollbar-track {
        background: #613659; /* color of the track */
        border-radius: 10px; /* roundness of the scrollbar track */
    }
}

`

export default chatAppStyles
