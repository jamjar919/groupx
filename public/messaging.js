const MESSAGES_ID = 'messages';

const state = {
    participants: null,
    next: [],
    topic: '',
    snapScroll: true,
    cumulative: [],
    max: 0,
};

function getParticipants(callback) {
    fetch('/api/participants')
    .then(function(response) {
        if (!response.ok) {
            throw Error(response.statusText)
        }
        return response.json();
    })
    .then(function(result) {
        callback(result)
    })
    .catch(function(error) {
        callback({error: error})
    })
}

function messageHTML(messages, id, self) {
    let result = 
    '<div class="message-wrapper '+ (self ? 'self' : '') +'">' +
        '<div class="image">' +
            '<img src="'+ (state.participants[id].image || ('http://placekitten.com/50/50?q='+id) )+'" />' +
        '</div>' +
        '<div class="message-content">' + 
            '<div class="from">'+ state.participants[id].name +'</div>';
    
    messages.forEach(message => {
        result += '<div class="message">'+ message.content + '</div>';
    });

    result += '</div>' +
    '</div>';

    return result;
}

/** inclusive */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomParticipantId() {
    let i = 0;
    const n = getRandomInt(0, state.max);
    while (state.cumulative[i] <= n) {
        i += 1;
    }
    return i;
}

function fillQueue() {
    const next = [];
    let currentItem = {};
    while (next.length < 10) {
        next.push(getRandomParticipantId())
    }
    const result = [];
    let current = {
        person: getRandomParticipantId(),
        count: 1,
    }
    for (let i = 0; i < next.length; i += 1) {
        if (next[i] === current.person) {
            current.count += 1
        } else {
            result.push(current)
            current = {
                person: next[i],
                count: 1,
            }
        }
    }
    result.push(current)
    return result;
}

function talk() {
    const next = state.next.pop();
    if (!next) {
        // Nothing in talk queue, queue some stuff
        state.next = fillQueue();
    } else {
        const pid = next.person;
        const count = next.count;
        let trigger = state.topic || '';
        if (Math.random() < 0.25) {
            trigger = '';
        }
        fetch('/api/message/'+pid+'/'+trigger+'?count='+count)
        .then(function(response) {
            if (!response.ok) {
                throw Error(response.statusText)
            }
            return response.json();
        })
        .then(function(result) {
            const message = messageHTML(result.messages, pid, false)
            if (Math.random() < 0.5) {
                // change the topic! 
                const words = result.messages[0].content.split(" ");
                const word = words[getRandomInt(0, words.length - 1)]
                state.topic = word;
                console.log("now loosely chatting about "+word)
            }
            $("#"+MESSAGES_ID).append($(message));

            if (state.snapScroll) {
                $(document).off("scroll");
                window.scrollTo(0,document.body.scrollHeight);
                $(document).scroll(scrollSnapFunction)
            }
        })
        .catch(function(error) {
            console.error(error);
        })
    }
}

function scrollSnapFunction() {
    state.snapScroll = false;
    setTimeout(function() { state.snapScroll = true; }, 5000)
}

$(document).ready(function () {
    // Initialise the participants by call to api
    getParticipants(function(result) {
        state.participants = result;
        let sum = 0;
        for (let i = 0; i < result.length; i += 1) {
            sum += result[i].numMessages;
            state.cumulative.push(sum);
        }
        state.max = sum;
        state.next = fillQueue();
        talk()
    })

    $(document).scroll(scrollSnapFunction)

    // Initialise the talking loop
    setInterval(talk, 1000)
});