var express = require("express");
var app = express();
var markov = require('./chain.js');
var fs = require('fs');
var iconv = require('iconv-lite');


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
    ).map(message => {
        const buff = new Buffer(message.content, 'utf8');
        const content = iconv.decode(buff, 'latin1');//'ISO-8859-1');
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
    console.log("Getting result for " + chains[pid].name + "(" + req.params.pid + ")");
    res.json({content: chains[pid].chain.generate(), trigger: false });
});

app.get("/api/:pid/:trigger", function(req, res) {
    const pid = parseInt(req.params.pid);
    let trigger = req.params.trigger
    let content = '';
    console.log("Getting result for " + chains[pid].name + "(" + req.params.pid + ") with trigger "+ trigger);
    try {
        content = chains[pid].chain.generate(trigger);
    } catch (e) {
        console.log("whoops, never used that word");
        content = chains[pid].chain.generate();
        trigger = false;
    } 
    res.json({ content, trigger });

});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});