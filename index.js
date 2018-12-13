var express = require("express");
var app = express();
var markov = require('./chain.js');
var fs = require('fs');
var iconv = require('iconv-lite');

// Read the last datafile in the messages folder if it's not supplied in the variables
let data = null;
let filename = process.env.DATAFILE || null;
if (!filename) {
    fs.readdirSync('messages').forEach(file => {
        const parts = file.split('.');
        if (parts[1] === 'json') {
            filename = file;
        }
    })
}
if (filename) {
    data = JSON.parse(fs.readFileSync('messages/'+filename, 'utf8'));
    console.info("Loading file "+filename);
} else {
    console.error("No JSON files found in the ./messages/ folder, did you create it and put in your message archive?")
}

function getMessagesFor(messages, name) {
    return messages.filter(
        message => (
            (message.sender_name === name) &&
            (!message.hasOwnProperty("photos")) &&
            (message.content) &&
            (message.content !== "You sent a photo.") && 
            (message.content.substr(0, 4) !== "http")
        )
    ).map(message => {
        const buff = new Buffer(message.content, 'utf8');
        const content = iconv.decode(buff, 'ISO-8859-1');
        return content
    })
}

app.use(express.static('public'))

app.get("/", function(req, res) {
    res.sendfile('public/index.html')
});

const participants = data.participants.map(p => p.name);
const messages = data.messages;

const chains = [];
participants.forEach(name => {
    chains.push({
        name,
        chain: new markov.Chain(getMessagesFor(messages, name))
    })
});

console.log(chains);

app.get("/api/:pid", function(req, res) {
    const pid = parseInt(req.params.pid);
    const person = chains[pid].name;

    console.log("Getting result for " + person + "(" + req.params.pid + ")");
    res.json({ content: chains[pid].chain.generate(), trigger: false, person });
});

app.get("/api/:pid/:trigger", function(req, res) {
    const pid = parseInt(req.params.pid);
    const person = chains[pid].name;
    let trigger = req.params.trigger

    let content = '';
    console.log("Getting result for " + person + "(" + req.params.pid + ") with trigger "+ trigger);
    try {
        content = chains[pid].chain.generate(trigger);
    } catch (e) {
        console.log("whoops, never used that word");
        content = chains[pid].chain.generate();
        trigger = false;
    } 
    res.json({ content, trigger, person });

});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});