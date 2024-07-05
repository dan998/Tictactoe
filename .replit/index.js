const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

let rooms = {};

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('joinRoom', (room) => {
    socket.join(room);
    if (!rooms[room]) {
      rooms[room] = { players: [], board: Array(9).fill(null), turn: 'X' };
    }
    rooms[room].players.push(socket.id);

    if (rooms[room].players.length === 2) {
      io.to(room).emit('startGame', rooms[room]);
    }
  });

  socket.on('makeMove', ({ room, index }) => {
    if (rooms[room]) {
      const { board, turn } = rooms[room];
      if (!board[index]) {
        board[index] = turn;
        rooms[room].turn = turn === 'X' ? 'O' : 'X';
        io.to(room).emit('moveMade', { board, turn: rooms[room].turn });
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
    for (const room in rooms) {
      const playerIndex = rooms[room].players.indexOf(socket.id);
      if (playerIndex !== -1) {
        rooms[room].players.splice(playerIndex, 1);
        if (rooms[room].players.length === 0) {
          delete rooms[room];
        } else {
          io.to(room).emit('playerLeft');
        }
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
