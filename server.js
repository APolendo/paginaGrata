const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const duos = {}; 

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('select-duo', (duo) => {
        socket.join(duo); 
        if (duos[duo]) {
           
            socket.emit('reorder-images', duos[duo]);
        }
    });

    socket.on('reorder-images', ({ duo, order }) => {
        duos[duo] = order; 
        io.to(duo).emit('reorder-images', order); 
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
