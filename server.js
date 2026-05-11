const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http'); 
const { Server } = require('socket.io'); 
const restApi = require('./rest');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', restApi);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/game', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'game.html'));
});

io.on('connection', (socket) => {
  socket.secretNumber = Math.floor(Math.random() * 100) + 1;
  socket.attempts = 0;
  socket.gameOver = false;
  socket.playerName = 'Гость';

  socket.on('set_name', (name) => {
    socket.playerName = name || 'Гость';
    io.emit('chat_message', {
      system: true,
      text: `${socket.playerName} присоединился к игре!`
    });
  });

  socket.on('guess', (number) => {
    if (socket.gameOver) {
      socket.emit('chat_message', { system: true, text: 'Начните новую игру!' });
      return;
    }

    const guess = parseInt(number);
    if (isNaN(guess) || guess < 1 || guess > 100) {
      socket.emit('chat_message', { system: true, text: 'Введите число от 1 до 100.' });
      return;
    }

    socket.attempts++;
    io.emit('chat_message', {
      system: false,
      name: socket.playerName,
      text: `называет число ${guess}`
    });

    let response;
    if (guess < socket.secretNumber) {
      response = '📉 Загаданное число больше!';
    } else if (guess > socket.secretNumber) {
      response = '📈 Загаданное число меньше!';
    } else {
      socket.gameOver = true;
      response = `🎉 ${socket.playerName} угадал число ${socket.secretNumber} за ${socket.attempts} попыток!`;
      io.emit('chat_message', { system: true, text: response });
      socket.emit('game_won', { attempts: socket.attempts });
      return;
    }

    socket.emit('chat_message', { system: true, text: response });
  });

  socket.on('new_game', () => {
    socket.secretNumber = Math.floor(Math.random() * 100) + 1;
    socket.attempts = 0;
    socket.gameOver = false;
    socket.emit('chat_message', { system: true, text: '🔄 Новая игра начата! Угадайте число от 1 до 100.' });
  });

  socket.on('chat_message', (text) => {
    io.emit('chat_message', {
      system: false,
      name: socket.playerName,
      text: text
    });
  });

  socket.on('disconnect', () => {
    io.emit('chat_message', {
      system: true,
      text: `${socket.playerName} покинул игру.`
    });
  });
});

server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});