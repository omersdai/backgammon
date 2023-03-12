const pieceContainersEl = document.getElementById("pieceContainers");
const rowElements = pieceContainersEl.querySelectorAll(".row");
const slotElements = [
  ...Array.from(rowElements[2].querySelectorAll(".slot")).reverse(),
  ...Array.from(rowElements[0].querySelectorAll(".slot")).reverse(),
  ...Array.from(rowElements[1].querySelectorAll(".slot")),
  ...Array.from(rowElements[3].querySelectorAll(".slot")),
];

// [slotIdx, numberOfPieces]
const piecePlacements = [
  [0, 2],
  [11, 5],
  [16, 3],
  [18, 5],
];

const [WHITE, BLACK] = ["white", "black"];

let draggedPiece;

initializeGame();

function startGame() {
  draggedPiece = null;
  clearPieces();
  placePieces();
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

function dragStart(e) {
  draggedPiece = e.currentTarget;
}

function dragEnd(e) {
  draggedPiece = null;
}

function dragEnter(e) {
  if (!draggedPiece) return;
  e.currentTarget.classList.add("hover");
}

function dragLeave(e) {
  if (!draggedPiece) return;
  e.currentTarget.classList.remove("hover");
}

function drop(e) {
  e.preventDefault();
  if (!draggedPiece) return;
  e.currentTarget.classList.remove("hover");
  const idx = parseInt(e.currentTarget.getAttribute("index"));
  movePiece(draggedPiece, idx);
}

function dragOver(e) {
  e.preventDefault();
}

console.log(slotElements);
