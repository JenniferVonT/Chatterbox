# Chatterbox

Välkommen till chatterbox! En enkel chatt applikation där du kan kommunicera med vänner både med text, ljud och video. En Node.js applikation som körs huvudsakligen från servern och använder sig av routes och controllers för att röra sig genom webbplatsen/applikationen.
WebSockets gör det möjligt för användaren att få realtids uppdateringar i applikationen både för att ta emot samtal, meddelanden eller vänförfrågningar.
WebbRTC används i sammarbete med WebSocket för att upprätta en kontakt för audio och video samtal mellan två användare.

Framtida uppdateringar/sprints:

GIF support
Implementera Electron eller NW.js för att kunna köra applikationen som en desktop applikation.
Implementera teman för vyn (endast utseende) med t.ex. andra färgteman.
Grupp chatt.
Effektivisera video/audio chatten för att göra den mer stabil och lägga till den "mute" knapp för kunna stänga av och sätta på ljud-input.