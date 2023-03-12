const pieceContainersEl = document.getElementById("pieceContainers");
const whiteRollBtn = document.getElementById("whiteRollBtn");
const blackRollBtn = document.getElementById("blackRollBtn");

const rowElements = pieceContainersEl.querySelectorAll(".row");
const slotElements = [
  ...Array.from(rowElements[2].querySelectorAll(".slot")).reverse(),
  ...Array.from(rowElements[0].querySelectorAll(".slot")).reverse(),
  ...Array.from(rowElements[1].querySelectorAll(".slot")),
  ...Array.from(rowElements[3].querySelectorAll(".slot")),
];

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

let draggedPiece;
let rolls;
let isTurnDecided; // initially roll a single dice to decide who goes first
let isRolledDice;
let isWhiteTurn;

initializeGame();

function startGame() {
  draggedPiece = null;
  rolls = null;
  isTurnDecided = false;
  clearPieces();
  placePieces();
}

function rollDice(e) {
  console.log("clicked!!");
  const btnEl = e.currentTarget;
  const [roll1, roll2] = [getRandomNumber(1, 6), getRandomNumber(1, 6)];
  showDices(btnEl, roll1, roll2);
}

function showDices(btnEl, roll1, roll2) {
  // btnEl.classList.add("hide");
  const dices = btnEl.nextElementSibling;
  const diceEl1 = dices.firstElementChild;
  const diceEl2 = diceEl1.nextElementSibling;

  diceEl1.innerHTML = diceIcons[roll1];
  diceEl2.innerHTML = diceIcons[roll2];

  landDice(diceEl1);
  landDice(diceEl2);

  dices.classList.remove("hide");
}

function landDice(diceEl) {
  const [xTransform, yTransform] = [
    getRandomNumber(-30, 30),
    getRandomNumber(-40, 40),
  ];

  diceEl.style.transform = `translate(${xTransform}px, ${yTransform}px)`;
}

function placePieces() {
  const n = slotElements.length;

  for (const [idx, count] of piecePlacements) {
    for (let i = 0; i < count; i++) {
      slotElements[idx].appendChild(createPiece(BLACK));
      slotElements[n - 1 - idx].appendChild(createPiece(WHITE));
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
  const idx = parseInt(e.currentTarget.getAttribute("index"));
  movePiece(draggedPiece, idx);
}

function dragOver(e) {
  e.preventDefault();
}

function getRandomNumber(min, max) {
  return parseInt(Math.random() * (max - min + 1) + min);
}
