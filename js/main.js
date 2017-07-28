"use strict"

let theBoard;
const easy = document.getElementById('easy')
const medium = document.getElementById('medium')
const hard = document.getElementById('hard')
const gameBoard = document.getElementById('board')
const gameOverMessage = document.getElementById('game-over')

const gameMode = (e = window.event) => {
  let difficulty = e.target.innerHTML
  gameOverMessage.style['visibility'] = 'hidden'
  gameBoard.innerHTML = ''
  switch(difficulty) {
    case "easy":
      theBoard = new Board(9, 10)
      theBoard.render()
      break;
    case "medium":
      theBoard = new Board(14, 35)
      theBoard.render()
      break;
    case "hard":
      theBoard = new Board(18, 60)
      theBoard.render()
      break;
    default:
      theBoard = new Board(9, 10)
      theBoard.render()
  }
}

const surroundingSquareCords = [
                            [-1, 0],
                            [-1, 1],
                            [0, 1],
                            [1, 1],
                            [1, 0],
                            [1, -1],
                            [0, -1],
                            [-1, -1]
                           ]

const included = (arr1, arr2) => {
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i][0] === arr2[0] && arr1[i][1] === arr2[1]) return true
  }
  return false
};

const generateRandomCords = (numberOfCords, width, height) => {
  let cordArray = []
  while (cordArray.length < numberOfCords) {
    let cord1 = Math.floor((Math.random() * height))
    let cord2 = Math.floor((Math.random() * width))
    if (included(cordArray, [cord1, cord2])) { continue }
    cordArray.push([cord1, cord2])
  }
  return cordArray
};

const getSurroundingSquareCords = (cord, length) => {
  let arr = []
  surroundingSquareCords.forEach(element => {
    let first = cord[0] + element[0]
    let second = cord[1] + element[1]
    if(first < 0 || second < 0 || first > (length-1) || second > (length-1)) return
    arr.push([first, second])
  })
  return arr
}

const showMines = () => {
  theBoard.mineCords.forEach(cord => {
    let cordString = cord[0] + '-' + cord[1]
    let square = document.querySelectorAll(`[cord="${cordString}"]`)[0]
    square.classList.remove('flag')
    square.classList.add('kevin')
  })
}

const gameOver = (gameStatus) => {
  let squares = document.getElementsByClassName('square')
  for (let i = 0; i < squares.length; i++) {
    squares[i].removeEventListener('click', leftClick)
    squares[i].removeEventListener('contextmenu', rightClick)
  }
  if (gameStatus === "winner") {
    gameOverMessage.innerHTML = "WINNER";
    gameOverMessage.style["visibility"] = 'visible'
  } else {
    gameOverMessage.innerHTML = "LOSER";
    gameOverMessage.style["visibility"] = 'visible'
  }
  showMines();
}

const checkWinner = () => {
  let winner = theBoard.mineCords.every(cord => {
    let cordString = cord[0] + '-' + cord[1]
    let square = document.querySelectorAll(`[cord="${cordString}"]`)[0]
    return square.classList.contains('flag')
  })
  if (winner) gameOver("winner")
}

const updateGameBoard = (cords) => {
  cords.forEach(cord => {
    let value = theBoard.board[cord[0]][cord[1]]
    let cordString = cord[0] + '-' + cord[1]
    let square = document.querySelectorAll(`[cord="${cordString}"]`)[0]
    square.removeEventListener('click', leftClick)
    square.removeEventListener('contextmenu', rightClick)
    square.classList.remove('change-background')
    square.innerHTML = value > 0 ? value : ''
  })
}

const uncoverSquares = (square) => {
  let stack = []
  let cords = []
  stack.push(square.getAttribute('cord').split('-').map(element => Number(element)))
  while (stack.length > 0) {
    let cord = stack.pop()
    cords.push(cord)
    if (theBoard.board[cord[0]][cord[1]] > 0) continue
    let surroundingSquares = getSurroundingSquareCords(cord, theBoard.board[cord[0]].length)
    surroundingSquares.forEach(element => {
      if (theBoard.board[element[0]][element[1]] === "M") return
      if (included(cords, element)) return
      if (included(stack, element)) return
      stack.push(element)
    })
  }
  updateGameBoard(cords)
}

class Board {
  constructor(theSize, theMines, theMode) {
    this.size = theSize * 20
    this.mode = theMode
    this.board = this.createBoard(theSize)
    this.numberOfMines = theMines
    this.flags = theMines
    this.mineCords = generateRandomCords(theMines, theSize, theSize)
    this.addMines(this.mineCords)
    this.addNumbers()
  }
  
  createBoard(size) {
    let a = new Array(size);
    for(let i = 0; i < a.length; i++) {
      a[i] = new Array(size)
    }
    return a
  }
  
  render() {
    gameBoard.style['width'] = `${this.size}px`;
    for (let i = 0; i < this.board.length; i++) {
      let row = document.createElement('div')
      for (let j = 0; j < this.board[i].length; j++) {
        let square = document.createElement('div')
        square.setAttribute('cord', i + '-' + j)
        square.style['width'] = '20px'
        square.style['height'] = '20px'
        square.classList.add('square')
        square.classList.add('change-background')
        square.classList.add('center-flex')
        square.addEventListener('click', leftClick)
        square.addEventListener('contextmenu', rightClick)
        row.appendChild(square)
      }
      gameBoard.appendChild(row)
    }
  }
  
  addMines(cords) {
    for (let i = 0; i < cords.length; i++) {
      let cord1 = cords[i][0]
      let cord2 = cords[i][1]
      this.board[cord1][cord2] = "M"
    }
  }
  
  addNumbers() {
    for(let i = 0; i < this.board.length; i++) {
      for(let j = 0; j < this.board[i].length; j++) {
        let boardLength = this.board[i].length
        if(this.board[i][j] === 'M') continue
        let surroundingSquares = getSurroundingSquareCords([i,j], this.board[i].length)
        let countMines = surroundingSquares.reduce( (count, square) => {
          return this.board[square[0]][square[1]] === 'M' ? count + 1 : count
        }, 0)
        this.board[i][j] = countMines
      }
    }
  }
}

function leftClick(e = window.event) {
  e.preventDefault()
  let square = e.target
  if (square.classList.contains('flag')) {
    square.classList.remove('flag')
    theBoard.flags += 1
  }
  let cord = square.getAttribute('cord').split('-')
  let boardSquare = theBoard.board[cord[0]][cord[1]]
  if (boardSquare === 'M') {
    gameOver("loser")
    return
  }
  uncoverSquares(square)
}

function rightClick(e = window.event) {
  e.preventDefault()
  let square = e.target
  if (square.classList.contains('flag')) {
    square.classList.toggle('flag')
    theBoard.flags += 1
  } else {
    if (theBoard.flags === 0) return
    square.classList.toggle('flag')
    theBoard.flags -= 1
  }
  checkWinner()
}

document.addEventListener('DOMContentLoaded', function() {
  easy.addEventListener('click', gameMode)
  medium.addEventListener('click', gameMode)
  hard.addEventListener('click', gameMode)
  theBoard = new Board(9, 10)
  theBoard.render()
});