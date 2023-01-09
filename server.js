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
let palavraInvertida;
// var tamPalavra;
// const vogais = ["a", "e", "i", "o", "u"];

io.on('connection', socket => {
    console.log(`Socket conectado: ${socket.id}`);

    // 2) Servidor recebe a informação, trata e devolve pro Cliente: 
    socket.on('messageToInvert', data => {
        messages = JSON.stringify(data.word);
        palavraInvertida = messages.split("").reverse().join("");

        socket.emit('receivedMessage', palavraInvertida);
    }); 

    socket.on('letterCounter', data => {
        messages = JSON.stringify(data.word);
        tamPalavra = messages.length - 2;       

        socket.emit('counterMessage', tamPalavra);
    }); 

    //     socket.on('letterCounter', data => {
    //     messages = JSON.stringify(data.message);
    //     tamPalavra = messages.length - 2;
    //     palavraInvertida = messages.split("").reverse().join("");

    //     function contaVogal(string) {
    //         let count = 0;

    //         for (let letra of string.toLowerCase()) {
    //             if (vogais.includes(letra)) {
    //                 count++;
    //             };
    //         };

    //         return count;
    //     };

    //     var numVogais = contaVogal(messages);
    //     var numConsoantes = tamPalavra - numVogais;

    //     messages = {
    //         palavraInvertida: palavraInvertida,
    //         tamPalavra: tamPalavra,
    //         numVogais: numVogais,
    //         numConsoantes: numConsoantes,
    //     };

    //     socket.broadcast.emit('receivedMessage', messages.palavraInvertida);
    // }); 
});

server.listen(3000);

