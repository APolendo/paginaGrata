const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const initialImages = [
    '/imagenes/CS.png',
    '/imagenes/FG.png',
    '/imagenes/FN.png',
    '/imagenes/RL.png',
    '/imagenes/WZ.png'
];

const duoStates = {};

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
    let currentDuoId;

    socket.on('join duo', (duoId) => {
        socket.join(duoId);
        currentDuoId = duoId;

        if (!duoStates[duoId]) {
            duoStates[duoId] = {
                currentIndex: 0,
                images: shuffleImages([...initialImages]),
            };
        }

        socket.emit('sync', duoStates[duoId]);
    });

    socket.on('next image', (duoId) => {
        if (duoStates[duoId]) {
            duoStates[duoId].currentIndex = (duoStates[duoId].currentIndex + 1) % duoStates[duoId].images.length;
            io.to(duoId).emit('update image', duoStates[duoId]);
        }
    });
    // estoy 60% seguro de que esto funciona
    socket.on('update image', (data) => {
        loadImages(data);
    });
    //aqui termina
    socket.on('reset colors', (duoId) => {
        if (duoStates[duoId]) {
            duoStates[duoId].currentIndex = 0;
            io.to(duoId).emit('reset', duoStates[duoId]);
        }
    });

    socket.on('shuffle images', (duoId) => {
        if (duoStates[duoId]) {
            duoStates[duoId].images = shuffleImages(duoStates[duoId].images);
            duoStates[duoId].currentIndex = 0; 
            io.to(duoId).emit('shuffled', duoStates[duoId]);
        }
    });
});

function shuffleImages(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

server.listen(3000, () => {
    console.log('Servidor escuchando en http://localhost:3000');
});
