const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const duos = {}; // Objeto para almacenar los dúos y el orden de imágenes

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('select-duo', (duo) => {
        socket.join(duo); // El usuario se une a la "sala" del dúo seleccionado
        if (duos[duo]) {
            // Si ya hay un orden de imágenes para ese dúo, se lo enviamos al usuario que acaba de entrar
            socket.emit('reorder-images', duos[duo]);
        }
    });

    socket.on('reorder-images', ({ duo, order }) => {
        duos[duo] = order; // Guardamos el nuevo orden de las imágenes para el dúo seleccionado
        io.to(duo).emit('reorder-images', order); // Enviamos el nuevo orden solo a los usuarios del dúo
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
