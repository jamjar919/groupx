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
        if (
            (parts[1] === 'json') &&
            (parts.length === 2)
        ) {
            filename = file;
        }
    })
}
if (filename) {
    data = JSON.parse(fs.readFileSync('messages/'+filename, 'ascii'));
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
    ).map(message => message.content)
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

app.get("/api/participants", function(req, res) {
    res.json(
        chains.map((c, i) => {
            let image = false;
            if (fs.existsSync('messages/profilepics/'+i+'.jpg')) {
                image = '/api/profilepic/'+i+'.jpg'
            }
            return {
                id: i,
                image, 
                name: c.name,
                numMessages: c.chain.messageNum
            }
        })
    );
});

app.get("/api/message/:pid", function(req, res) {
    const pid = parseInt(req.params.pid);
    const person = chains[pid].name;    
    const num = Math.min(parseInt(req.query.count), 5) || 1;

    const messages = [];
    console.log("Getting " + person + "(" + req.params.pid + ") N: "+num);

    for (let i = 0; i < num; i += 1) {
        messages.push({
            content: chains[pid].chain.generate(),
            trigger: false,
        })
    }
    res.json({ messages, person });});

app.get("/api/message/:pid/:trigger", function(req, res) {
    const pid = parseInt(req.params.pid);
    const person = chains[pid].name;    
    const num = parseInt(req.query.count) || 1;
    let trigger = req.params.trigger

    const messages = [];
    console.log("Getting " + person + "(" + req.params.pid + ") T: "+ trigger + "  N: "+num);

    for (let i = 0; i < num; i += 1) {
        let content = '';
        trigger = req.params.trigger
        try {
            content = chains[pid].chain.generate(trigger);
        } catch (e) {
            content = chains[pid].chain.generate();
            trigger = false;
        }
        messages.push({
            content,
            trigger
        })
    }
    res.json({ messages, person });

});

app.get("/api/profilepic/:pid", function(req, res) {
    res.sendFile(parseInt(req.params.pid)+'.jpg', {root: __dirname + '/messages/profilepics'})
})

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});