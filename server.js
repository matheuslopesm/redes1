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
let consonants = ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "w", "x", "y", "z"];

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
            let countVowel = 0;
            let countConsonant = 0;

            for (let letter of string.toLowerCase()) {
                if (vowels.includes(letter)) {
                    countVowel++;
                }else if (consonants.includes(letter)){
                    countConsonant++;
                }
            };

            var typeObject = {
                typeVowels: countVowel,
                typeConsonants: countConsonant
            }

            return typeObject;
        };

        var types = vowelCounter(messageNormalized);

        // var numConsonant = wordSize - numVowel;

        var numbers = {
            vowel: types.typeVowels,
            consonant: types.typeConsonants
        };

        socket.emit('typedMessage', numbers);
    });
});

server.listen(3000);

