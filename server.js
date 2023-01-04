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

var messages;
var tamPalavra;
var palavraInvertida;
const vogais = ["a", "e", "i", "o", "u"];

io.on('connection', socket => {
    console.log(`Socket conectado: ${socket.id}`);

    socket.on('sendMessage', data => {
        messages = JSON.stringify(data.message);
        tamPalavra = messages.length - 2;
        palavraInvertida = messages.split("").reverse().join("");

        function contaVogal(string) {
            let count = 0;

            for (let letra of string.toLowerCase()) {
                if (vogais.includes(letra)) {
                    count++;
                };
            };

            return count;
        };

        var numVogais = contaVogal(messages);
        var numConsoantes = tamPalavra - numVogais;

        messages = {
            palavraInvertida: palavraInvertida,
            tamPalavra: tamPalavra,
            numVogais: numVogais,
            numConsoantes: numConsoantes,
        };

        socket.broadcast.emit('receivedMessage', messages.palavraInvertida);
    }); 
});

server.listen(3000);

