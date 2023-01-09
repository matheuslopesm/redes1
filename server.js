const express = require('express');
const { type } = require('os');
const path = require('path');

const app = express();

// Protocolo HTTP
const server = require('http').createServer(app);

// Protocolo Web Socket
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use('/', (req, res) => {
    res.render('index.html');
});

let messages;
let invertedWord;
let wordSize;
let messageWithoutSpace;
let messageNormalized;
const vowels = ["a", "e", "i", "o", "u"];

io.on('connection', socket => {
    console.log(`Socket conectado: ${socket.id}`);

    socket.on('messageToInvert', data => {
        messages = JSON.stringify(data.word);
        invertedWord = messages.split("").reverse().join("");

        socket.emit('invertedMessage', invertedWord);
    });

    socket.on('messageToCount', data => {
        messages = JSON.stringify(data.word);
        messageWithoutSpace = messages.replace(" ", "");
        wordSize = messageWithoutSpace.length - 2;

        socket.emit('countedMessage', wordSize);
    });

    socket.on('messageToType', data => {
        messages = JSON.stringify(data.word);
        messageWithoutSpace = messages.replace(" ", "");
        messageNormalized = messageWithoutSpace.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        wordSize = messageNormalized.length - 2;

        function vowelCounter(string) {
            let count = 0;

            for (let letter of string.toLowerCase()) {
                if (vowels.includes(letter)) {
                    count++;
                };
            };

            return count;
        };

        var numVowel = vowelCounter(messageNormalized);
        var numConsonant = wordSize - numVowel;

        var numbers = {
            vowel: numVowel, 
            consonant: numConsonant
        };

        socket.emit('typedMessage', numbers);
    });
});

server.listen(3000);

