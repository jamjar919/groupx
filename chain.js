var helper = require('./helper.js');

class Chain {
    constructor(messages) {
        this.messageNum = null;
        this.sol = "SOL";
        this.eol = "EOL";

        this.map = {
            "SOL": {
                prev: {},
                next: {}
            }
        };
        this.train(messages);
    }

    addToMap(before, word, after) {
        if (!helper.isInMap(word, this.map)) {
            this.map[word] = {
                prev: {},
                next: {}
            }
        }

        if (word !== this.eol) {
            if (!helper.isInMap(after, this.map[word].next)) {
                this.map[word].next[after] = 0;
            }
            this.map[word].next[after] += 1;
        }

        if (word !== this.sol) {
            if (!helper.isInMap(before, this.map[word].prev)) {
                this.map[word].prev[before] = 0;
            }
            this.map[word].prev[before] += 1;
        }
    }

    train(messages) {
        this.messageNum = messages.length;

        messages.forEach(message => {            
            message = helper.words(message);
            message = [this.sol, this.sol].concat(message.concat([this.eol, this.eol]))

            let pointer = 0;
            while (pointer < message.length - 2) {
                const window = message.slice(pointer, pointer + 3);

                this.addToMap(window[0], window[1], window[2]);

                pointer += 1;
            }
        });

        for (const word in this.map) {
            if (this.map.hasOwnProperty(word)) {
                let nextSum = 0;
                for (const next in this.map[word].next) {
                    nextSum += this.map[word].next[next];
                    this.map[word].next[next] = nextSum;
                }

                let prevSum = 0;
                for (const prev in this.map[word].prev) {
                    prevSum += this.map[word].prev[prev];
                    this.map[word].prev[prev] = prevSum;
                }
                this.map[word].nextSum = nextSum;
                this.map[word].prevSum = prevSum;
            }
        }
    }

    getWordFromMap(currentWord, map, max) {
        const wordPos = helper.getRandomInt(0, max);
        const keys = Object.keys(map);

        let i = 0;
        while (map[keys[i]] < wordPos) {
            i += 1;
        }
        return keys[i];
    }

    generate(trigger) {
        let sentence = '';
        let EOL = false;
        let currentWord = trigger || this.sol;;
        while(!EOL) {
            let nextWord = this.getWordFromMap(currentWord, this.map[currentWord].next, this.map[currentWord].nextSum);
            currentWord = nextWord;
            if (currentWord === this.eol) {
                EOL = true;
            } else {
                sentence += ' ' + currentWord;
            }
        }
        return sentence;
    }
}

exports.Chain = Chain;
