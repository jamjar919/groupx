var express = require("express");
var app = express();
var markov = require('./chain.js');
var fs = require('fs');
var data = JSON.parse(fs.readFileSync('message.json', 'utf8'));

function getMessagesFor(messages, name) {
    return messages.filter(
        message => (
            (message.sender_name === name) &&
            (!message.hasOwnProperty("photos")) &&
            (message.content) &&
            (message.content !== "You sent a photo.") && 
            (message.content.substr(0, 4) !== "http")
        )
    ).map(message => message.content)
}

app.use(express.static('public'))

app.get("/", function(req, res) {
    res.sendfile('public/index.html')
});

const participants = data.participants;
console.log(participants);
const messages = data.messages;

var james = new markov.Chain(getMessagesFor(messages, "James Paterson"));

app.get("/api", function(req, res) {
    res.send(james.generate());
});


var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});