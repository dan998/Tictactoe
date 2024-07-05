const socket = io();
const X_CLASS = 'x';
const CIRCLE_CLASS = 'circle';
let currentClass;
let myTurn;
let room = prompt("Enter room name:");

socket.emit('joinRoom', room);

socket.on('startGame', (gameState) => {
  myTurn = gameState.players[0] === socket.id;
  currentClass = myTurn ? X_CLASS : CIRCLE_CLASS;
  setBoardHoverClass();
});

socket.on('moveMade', ({ board, turn }) => {
  updateBoard(board);
  myTurn = currentClass === turn;
  setBoardHoverClass();
});

socket.on('playerLeft', () => {
  alert('The other player left the game.');
});

const cellElements = document.querySelectorAll('[data-cell]');
const board = document.getElementById('board');
const winningMessageElement = document.getElementById('winning-message');
const winningMessageTextElement = document.querySelector('[data-winning-message-text]');
const restartButton = document.getElementById('restartButton');

cellElements.forEach(cell => {
  cell.addEventListener('click', handleClick);
});

restartButton.addEventListener('click', () => {
  socket.emit('restartGame', room);
});

function handleClick(e) {
  if (!myTurn) return;
  const cell = e.target;
  const index = [...cellElements].indexOf(cell);
  socket.emit('makeMove', { room, index });
}

function updateBoard(board) {
  cellElements.forEach((cell, index) => {
    cell.classList.remove(X_CLASS);
    cell.classList.remove(CIRCLE_CLASS);
    if (board[index]) {
      cell.classList.add(board[index] === 'X' ? X_CLASS : CIRCLE_CLASS);
    }
  });
}

function setBoardHoverClass() {
  board.classList.remove(X_CLASS);
  board.classList.remove(CIRCLE_CLASS);
  if (myTurn) {
    board.classList.add(currentClass);
  }
}
