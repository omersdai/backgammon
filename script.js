const pieceContainersEl = document.getElementById("pieceContainers");
const whiteRollBtn = document.getElementById("whiteRollBtn");
const blackRollBtn = document.getElementById("blackRollBtn");
const capturedPiecesEl = document.getElementById("capturedPieces");

const rowElements = pieceContainersEl.querySelectorAll(".row");
const slotElements = [
  ...Array.from(rowElements[2].querySelectorAll(".slot")).reverse(),
  ...Array.from(rowElements[0].querySelectorAll(".slot")).reverse(),
  ...Array.from(rowElements[1].querySelectorAll(".slot")),
  ...Array.from(rowElements[3].querySelectorAll(".slot")),
];
const slotCount = slotElements.length;

const CLICK = "click";

// [slotIdx, numberOfPieces]
const piecePlacements = [
  [0, 2],
  [11, 5],
  [16, 3],
  [18, 5],
];

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

capturedPiecesEl.appendChild(createPiece(WHITE));

let draggedPiece;
let rolls;
let isTurnDecided; // initially roll a single dice to decide who goes first
let isRolledDice;
let isWhiteTurn;

initializeGame();

function startGame() {
  draggedPiece = null;
  rolls = [null, null];
  isTurnDecided = false;
  isRolledDice = false;
  isWhiteTurn = null;

  blackRollBtn.disabled = true;
  // Hide first dices for each color to decide turn
  whiteRollBtn.nextElementSibling.firstElementChild.classList.add("hide");
  blackRollBtn.nextElementSibling.firstElementChild.classList.add("hide");

  clearPieces();
  placePieces();
}

function movePiece(pieceEl, destinationSlotEl) {
  const color = pieceEl.getAttribute("color");

  if (!isTurnDecided || (color === WHITE) !== isWhiteTurn || !isRolledDice)
    return;

  const originSlotEl = pieceEl.parentElement;
  const slotIdx = destinationSlotEl.getAttribute("index");
  let distance;

  if (originSlotEl === capturedPiecesEl) {
    distance = color === BLACK ? slotIdx + 1 : slotIdx - slotCount;
  } else {
    distance = slotIdx - originSlotEl.getAttribute("index");
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

  if (rolls.length === 0) {
    isWhiteTurn = !isWhiteTurn;
    isRolledDice = false;
    const oppositeRollBtn = isWhiteTurn ? whiteRollBtn : blackRollBtn;
    oppositeRollBtn.disabled = false;
  }

  console.log(rolls);
}

function isValidMove(color, distance) {
  const dir = color === WHITE ? -1 : 1;
  distance = distance * dir;
  console.log(
    "isvalidMove returned ",
    rolls.some((roll) => distance === roll)
  );
  return rolls.some((roll) => distance === roll);
}

function isOccupied(color, destinationSlotEl) {
  const pieceElements = destinationSlotEl.children;

  console.log(
    "isOccupied returned",
    pieceElements.length > 1 && color !== pieceElements[0].getAttribute("color")
  );

  return (
    pieceElements.length > 1 && color !== pieceElements[0].getAttribute("color")
  );
}

function hasCapturedPiece(color) {
  const capturedPieceElements = capturedPiecesEl.children;

  console.log(
    "hasCapturedPiece returned",
    capturedPieceElements.length > 0 &&
      color === capturedPieceElements[0].getAttribute("color")
  );

  return (
    capturedPieceElements.length > 0 &&
    color === capturedPieceElements[0].getAttribute("color")
  );
}

function isBlot(color, destinationSlotEl) {
  const pieceElements = destinationSlotEl.children;
  return (
    pieceElements.length === 1 &&
    color !== pieceElements[0].getAttribute("color")
  );
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
  // Do it once somehow
  whiteRollBtn.nextElementSibling.firstElementChild.classList.remove("hide");
  blackRollBtn.nextElementSibling.firstElementChild.classList.remove("hide");
  ////

  const oppositeRollBtn = btnEl === whiteRollBtn ? blackRollBtn : whiteRollBtn;
  const oppositeDices = oppositeRollBtn.nextElementSibling;

  btnEl.classList.add("hide");
  oppositeRollBtn.classList.remove("hide");
  oppositeRollBtn.disabled = true;
  oppositeDices.classList.add("hide");

  const [dices, diceEl1, diceEl2] = getDices(btnEl);
  const [roll1, roll2] = [getRandomNumber(1, 6), getRandomNumber(1, 6)];

  showDice(diceEl1, roll1);
  showDice(diceEl2, roll2);

  dices.classList.remove("hide");

  isRolledDice = true;
  rolls = roll1 !== roll2 ? [roll1, roll2] : [roll1, roll1, roll1, roll1];
}

function decideTurn(btnEl) {
  const roll = getRandomNumber(1, 6);
  const [dices, diceEl1, diceEl2] = getDices(btnEl);
  diceEl2.innerHTML = diceIcons[roll];
  dices.classList.remove("hide");

  if (btnEl === whiteRollBtn) {
    whiteRollBtn.disabled = true;
    blackRollBtn.disabled = false;
    const blackDices = blackRollBtn.nextElementSibling;
    blackDices.classList.add("hide");
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
}

function createPiece(color) {
  const pieceEl = document.createElement("div");
  pieceEl.className = `piece bg-${color}`;
  pieceEl.setAttribute("color", color);
  pieceEl.draggable = true;
  pieceEl.addEventListener("dragstart", dragStart);
  pieceEl.addEventListener("dragend", dragEnd);

  return pieceEl;
}

function initializeGame() {
  slotElements.forEach((slotElement, idx) => {
    slotElement.setAttribute("index", idx);

    slotElement.addEventListener("dragenter", dragEnter);
    slotElement.addEventListener("dragleave", dragLeave);
    slotElement.addEventListener("drop", drop);
    // Dragging is not enabled by default
    slotElement.addEventListener("dragover", dragOver);
  });

  startGame();
}

//////////////////
// Event Listeners
//////////////////
whiteRollBtn.addEventListener(CLICK, rollDice);
blackRollBtn.addEventListener(CLICK, rollDice);

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
  console.log("dropped", draggedPiece);
  const idx = parseInt(e.currentTarget.getAttribute("index"));
  console.log(idx);
  movePiece(draggedPiece, e.currentTarget);
}

function dragOver(e) {
  e.preventDefault();
}

function getDices(btnEl) {
  const dices = btnEl.nextElementSibling;
  const diceEl1 = dices.firstElementChild;
  const diceEl2 = diceEl1.nextElementSibling;
  return [dices, diceEl1, diceEl2];
}

function getRandomNumber(min, max) {
  return parseInt(Math.random() * (max - min + 1) + min);
}
