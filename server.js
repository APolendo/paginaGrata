const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

let duos = {};

io.on('connection', (socket) => {
    console.log('Un cliente se ha conectado:', socket.id);

    socket.on('join duo', (duoId) => {
        if (!duos[duoId]) {
            duos[duoId] = [];
        }

        if (duos[duoId].length < 2) {
            duos[duoId].push(socket.id);
            socket.join(duoId);
            socket.emit('duo joined', duoId);
            console.log(`Cliente ${socket.id} se unió al dúo ${duoId}`);
        } else {
            socket.emit('duo full', duoId);
            console.log(`Dúo ${duoId} está lleno`);
        }
    });

    socket.on('next image', (duoId) => {
        socket.to(duoId).emit('update next image');
    });

    socket.on('reset colors', (duoId) => {
        socket.to(duoId).emit('colors reset');
    });

    socket.on('shuffle images', (duoId) => {
        socket.to(duoId).emit('images shuffled');
    });

    socket.on('disconnect', () => {
        console.log('Un cliente se ha desconectado:', socket.id);
        for (let duoId in duos) {
            duos[duoId] = duos[duoId].filter(id => id !== socket.id);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
