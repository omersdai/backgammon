const pieceContainersEl = document.getElementById("pieceContainers");
const whiteRollBtn = document.getElementById("whiteRollBtn");
const blackRollBtn = document.getElementById("blackRollBtn");
const capturedPiecesEl = document.getElementById("capturedPieces");

const poolContainerEl = document.getElementById("pool");
const whitePoolEl = document.getElementById("whitePool");
const blackPoolEl = document.getElementById("blackPool");

const whiteScoreEl = document.getElementById("whiteScore");
const blackScoreEl = document.getElementById("blackScore");
const resetBtn = document.getElementById("resetBtn");

const rowElements = pieceContainersEl.querySelectorAll(".row");
const slotElements = [
  ...Array.from(rowElements[2].querySelectorAll(".slot")).reverse(),
  ...Array.from(rowElements[0].querySelectorAll(".slot")).reverse(),
  ...Array.from(rowElements[1].querySelectorAll(".slot")),
  ...Array.from(rowElements[3].querySelectorAll(".slot")),
];
const slotCount = slotElements.length;

const [CLICK, INDEX, COLOR, HIDE] = ["click", "index", "color", "hide"];

// [slotIdx, numberOfPieces]
const piecePlacements = [
  [0, 2],
  [11, 5],
  [16, 3],
  [18, 5],
];

const pieceCount = piecePlacements.reduce(
  (sum, placement) => sum + placement[1],
  0
);

const diceIcons = [
  "",
  '<i class="fa-solid fa-dice-one"></i>',
  '<i class="fa-solid fa-dice-two"></i>',
  '<i class="fa-solid fa-dice-three"></i>',
  '<i class="fa-solid fa-dice-four"></i>',
  '<i class="fa-solid fa-dice-five"></i>',
  '<i class="fa-solid fa-dice-six"></i>',
];

const [WHITE, BLACK] = ["white", "black"];

let draggedPiece;
let rolls;
let isTurnDecided; // initially roll a single dice to decide who goes first
let isRolledDice;
let isWhiteTurn;
let isGameOver;
let isFirstTurn; // an unimportant boolean flag for optimization

initializeGame();

function startGame() {
  draggedPiece = null;
  rolls = [null, null];
  isTurnDecided = false;
  isRolledDice = false;
  isWhiteTurn = null;
  isGameOver = false;
  isFirstTurn = true;

  whiteRollBtn.classList.remove(HIDE);
  blackRollBtn.classList.remove(HIDE);
  whiteRollBtn.disabled = false;
  blackRollBtn.disabled = true;
  resetBtn.innerText = "Reset Game";

  const [whiteDices, whiteDiceEl1, whiteDiceEl2] = getDices(whiteRollBtn);
  const [blackDices, blackDiceEl1, blackDiceEl2] = getDices(blackRollBtn);

  whiteDices.classList.add(HIDE);
  blackDices.classList.add(HIDE);

  // Hide first dices for each color to decide turn
  whiteDiceEl1.classList.add(HIDE);
  blackDiceEl1.classList.add(HIDE);

  clearPieces();
  placePieces();
}

function makeMove(pieceEl, destinationSlotEl) {
  const color = pieceEl.getAttribute(COLOR);

  if (
    !isTurnDecided ||
    (color === WHITE) !== isWhiteTurn ||
    !isRolledDice ||
    isGameOver
  )
    return;

  if (destinationSlotEl !== poolContainerEl) {
    movePiece(pieceEl, destinationSlotEl);
  } else if (canPool(color)) {
    poolPiece(pieceEl);
  }

  console.log(rolls);
}

function movePiece(pieceEl, destinationSlotEl) {
  const color = pieceEl.getAttribute(COLOR);
  const originSlotEl = pieceEl.parentElement;
  const slotIdx = getIdx(destinationSlotEl);
  let distance;

  if (originSlotEl === capturedPiecesEl) {
    distance = color === BLACK ? slotIdx + 1 : slotIdx - slotCount;
  } else {
    distance = slotIdx - getIdx(originSlotEl);
  }

  if (
    !isValidMove(color, distance) ||
    isOccupied(color, destinationSlotEl) ||
    (originSlotEl !== capturedPiecesEl && hasCapturedPiece(color))
  )
    return;

  // Use roll
  const idx = rolls.indexOf(Math.abs(distance));
  rolls.splice(idx, 1);

  // Check if capturing piece
  if (isBlot(color, destinationSlotEl)) {
    const capturedPiece = destinationSlotEl.firstElementChild;
    destinationSlotEl.removeChild(capturedPiece);
    capturedPiecesEl.appendChild(capturedPiece);
  }

  originSlotEl.removeChild(pieceEl);
  destinationSlotEl.appendChild(pieceEl);

  if (!hasMoves(color)) finishTurn();
}

function poolPiece(pieceEl) {
  const color = pieceEl.getAttribute(COLOR);
  const originSlotEl = pieceEl.parentElement;
  if (originSlotEl === capturedPiecesEl) return;

  const poolEl = color === WHITE ? whitePoolEl : blackPoolEl;
  const slotIdx = getIdx(originSlotEl);
  const dir = getDirection(color);
  rolls.sort((a, b) => a - b); // ascending order

  let idx = null;
  for (let i = 0; i < rolls.length; i++) {
    const destinationIdx = slotIdx + rolls[i] * dir;
    if (isPoolMove(color, destinationIdx)) {
      idx = i;
      break;
    }
  }

  if (idx === null) return;

  rolls.splice(idx, 1);

  originSlotEl.removeChild(pieceEl);
  poolEl.appendChild(pieceEl);

  if (poolEl.children.length === pieceCount) winGame(color);
  else if (!hasMoves(color)) finishTurn();
}

function isValidMove(color, distance) {
  const dir = getDirection(color);
  distance = distance * dir;

  return rolls.some((roll) => distance === roll);
}

function isOccupied(color, destinationSlotEl) {
  const pieceElements = destinationSlotEl.children;

  return (
    pieceElements.length > 1 && color !== pieceElements[0].getAttribute(COLOR)
  );
}

function hasCapturedPiece(color) {
  const capturedPieceElements = Array.from(capturedPiecesEl.children);

  return capturedPieceElements.some(
    (piece) => color === piece.getAttribute(COLOR)
  );
}

function isBlot(color, destinationSlotEl) {
  const pieceElements = destinationSlotEl.children;
  return (
    pieceElements.length === 1 && color !== pieceElements[0].getAttribute(COLOR)
  );
}

function hasMoves(color) {
  if (hasCapturedPiece(color)) return canEnter(color);

  const dir = getDirection(color);

  for (let i = 0; i < slotCount; i++) {
    if (hasPiece(slotElements[i], color)) {
      for (const roll of rolls) {
        const destinationIdx = i + roll * dir;
        if (
          (isPoolMove(color, destinationIdx) && canPool(color)) ||
          (0 <= destinationIdx &&
            destinationIdx < slotCount &&
            !isOccupied(color, slotElements[destinationIdx]))
        )
          return true;
      }
    }
  }

  return false;
}

function canEnter(color) {
  for (const roll of rolls) {
    const destinationIdx = color === BLACK ? roll - 1 : slotCount - roll;
    if (!isOccupied(color, slotElements[destinationIdx])) return true;
  }

  return false;
}

function canPool(color) {
  if (hasCapturedPiece(color)) return false;

  const [start, end] = color === BLACK ? [0, slotCount - 6] : [6, slotCount];

  for (let i = start; i < end; i++) {
    if (hasPiece(slotElements[i], color)) return false;
  }

  return true;
}

function isPoolMove(color, destinationIdx) {
  return (
    (color === BLACK && destinationIdx >= slotCount) ||
    (color === WHITE && destinationIdx < 0)
  );
}

function hasPiece(slotEl, color) {
  const pieceElements = slotEl.children;
  return (
    0 < pieceElements.length && color === pieceElements[0].getAttribute(COLOR)
  );
}

function finishTurn() {
  isWhiteTurn = !isWhiteTurn;
  isRolledDice = false;
  const oppositeRollBtn = isWhiteTurn ? whiteRollBtn : blackRollBtn;
  oppositeRollBtn.disabled = false;
}

function winGame(color) {
  const [poolEl, oppositePoolEl, scoreEl] =
    color === WHITE
      ? [whitePoolEl, blackPoolEl, whiteScoreEl]
      : [blackPoolEl, whitePoolEl, blackScoreEl];

  let point = 0;
  if (poolEl.children.length === pieceCount) {
    point++;
    if (oppositePoolEl.children.length === 0) {
      point++;
      if (isBackgammonWin(color)) point++;
    }
  }

  isGameOver = true;
  scoreEl.innerText = parseInt(scoreEl.innerText) + point;
  resetBtn.innerText = "Play Again";
}

function isBackgammonWin(color) {
  const oppositeColor = color === WHITE ? BLACK : WHITE;
  if (hasCapturedPiece(oppositeColor)) return true;

  const [start, end] = color === WHITE ? [0, 6] : [slotCount - 6, slotCount];

  for (let i = start; i < end; i++) {
    if (hasPiece(slotElements[i], oppositeColor)) return true;
  }

  return false;
}

function rollDice(e) {
  const btnEl = e.currentTarget;
  if (!isTurnDecided) {
    decideTurn(btnEl);
  } else {
    startTurn(btnEl);
  }
}

function startTurn(btnEl) {
  if (isFirstTurn) {
    isFirstTurn = false;
    whiteRollBtn.nextElementSibling.firstElementChild.classList.remove(HIDE);
    blackRollBtn.nextElementSibling.firstElementChild.classList.remove(HIDE);
  }

  const oppositeRollBtn = btnEl === whiteRollBtn ? blackRollBtn : whiteRollBtn;
  const color = btnEl === whiteRollBtn ? WHITE : BLACK;
  const oppositeDices = oppositeRollBtn.nextElementSibling;

  btnEl.classList.add(HIDE);
  oppositeRollBtn.classList.remove(HIDE);
  oppositeRollBtn.disabled = true;
  oppositeDices.classList.add(HIDE);

  const [dices, diceEl1, diceEl2] = getDices(btnEl);
  const [roll1, roll2] = [getRandomNumber(1, 6), getRandomNumber(1, 6)];

  showDice(diceEl1, roll1);
  showDice(diceEl2, roll2);

  dices.classList.remove(HIDE);

  isRolledDice = true;
  rolls = roll1 !== roll2 ? [roll1, roll2] : [roll1, roll1, roll1, roll1];
  if (!hasMoves(color)) finishTurn();
}

function decideTurn(btnEl) {
  const roll = getRandomNumber(1, 6);
  const [dices, diceEl1, diceEl2] = getDices(btnEl);
  diceEl2.innerHTML = diceIcons[roll];
  diceEl2.style.transform = "translate(0px, 0px)";
  dices.classList.remove(HIDE);

  if (btnEl === whiteRollBtn) {
    whiteRollBtn.disabled = true;
    blackRollBtn.disabled = false;
    const blackDices = blackRollBtn.nextElementSibling;
    blackDices.classList.add(HIDE);
    rolls[0] = roll;
  } else {
    rolls[1] = roll;
    if (rolls[0] > rolls[1]) {
      isTurnDecided = true;
      isWhiteTurn = true;
      whiteRollBtn.disabled = false;
      blackRollBtn.disabled = true;
    } else if (rolls[0] < rolls[1]) {
      isTurnDecided = true;
      isWhiteTurn = false;
      whiteRollBtn.disabled = true;
      blackRollBtn.disabled = false;
    } else {
      // rolls[0] === rolls[1]
      whiteRollBtn.disabled = false;
      blackRollBtn.disabled = true;
    }
  }
}

function showDice(diceEl, roll) {
  diceEl.innerHTML = diceIcons[roll];

  const [xTransform, yTransform] = [
    getRandomNumber(-30, 30),
    getRandomNumber(-40, 40),
  ];

  diceEl.style.transform = `translate(${xTransform}px, ${yTransform}px)`;
}

function placePieces() {
  for (const [idx, count] of piecePlacements) {
    for (let i = 0; i < count; i++) {
      slotElements[idx].appendChild(createPiece(BLACK));
      slotElements[slotCount - 1 - idx].appendChild(createPiece(WHITE));
    }
  }
}

function clearPieces() {
  slotElements.forEach((slotElement) => (slotElement.innerHTML = ""));
  capturedPiecesEl.innerHTML = "";
  whitePoolEl.innerHTML = "";
  blackPoolEl.innerHTML = "";
}

function createPiece(color) {
  const pieceEl = document.createElement("div");
  pieceEl.className = `piece bg-${color}`;
  pieceEl.setAttribute(COLOR, color);
  pieceEl.draggable = true;
  pieceEl.addEventListener("dragstart", dragStart);
  pieceEl.addEventListener("dragend", dragEnd);

  return pieceEl;
}

function initializeGame() {
  slotElements.forEach((slotElement, idx) => {
    slotElement.setAttribute(INDEX, idx);

    slotElement.addEventListener("dragenter", dragEnter);
    slotElement.addEventListener("dragleave", dragLeave);
    slotElement.addEventListener("drop", drop);
    // Dragging is not enabled by default
    slotElement.addEventListener("dragover", dragOver);
  });

  poolContainerEl.addEventListener("dragenter", dragEnter);
  poolContainerEl.addEventListener("dragleave", dragLeave);
  poolContainerEl.addEventListener("drop", drop);
  poolContainerEl.addEventListener("dragover", dragOver);

  whiteScoreEl.innerText = 0;
  blackScoreEl.innerText = 0;

  startGame();
}

//////////////////
// Event Listeners
//////////////////
whiteRollBtn.addEventListener(CLICK, rollDice);
blackRollBtn.addEventListener(CLICK, rollDice);
resetBtn.addEventListener(CLICK, startGame);

function dragStart(e) {
  draggedPiece = e.currentTarget;
}

function dragEnd(e) {
  draggedPiece = null;
}

function dragEnter(e) {
  if (!draggedPiece) return;
  //   e.currentTarget.classList.add("hover");
}

function dragLeave(e) {
  if (!draggedPiece) return;
  //   e.currentTarget.classList.remove("hover");
}

function drop(e) {
  e.preventDefault();
  if (!draggedPiece) return;
  //   e.currentTarget.classList.remove("hover");
  const idx = getIdx(e.currentTarget);
  console.log(idx);
  makeMove(draggedPiece, e.currentTarget);
}

function dragOver(e) {
  e.preventDefault();
}

function getDirection(color) {
  return color === BLACK ? 1 : -1;
}

function getDices(btnEl) {
  const dices = btnEl.nextElementSibling;
  const diceEl1 = dices.firstElementChild;
  const diceEl2 = diceEl1.nextElementSibling;
  return [dices, diceEl1, diceEl2];
}

function getIdx(slotEl) {
  return parseInt(slotEl.getAttribute(INDEX));
}

function getRandomNumber(min, max) {
  return parseInt(Math.random() * (max - min + 1) + min);
}
