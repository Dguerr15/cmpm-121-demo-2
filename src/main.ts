import "./style.css";

const APP_NAME = "Hello world";
const app = document.querySelector<HTMLDivElement>("#app")!;

// Add Title
const title = document.createElement("h1");
title.textContent = APP_NAME;
app.appendChild(title);

// add Canvas
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
app.appendChild(canvas);

// add a clear canvas button
const clearButton = document.createElement("button");
clearButton.textContent = "Clear Canvas";
app.appendChild(clearButton);

// canvas context
const ctx = canvas.getContext("2d");
let isDrawing = false;

// event listnerns for drawing
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  ctx?.beginPath();
  ctx?.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    ctx?.lineTo(e.offsetX, e.offsetY);
    ctx?.stroke();
  }
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
});

canvas.addEventListener("mouseout", () => {
  isDrawing = false;
});

// Clear button
clearButton.addEventListener("click", () => {
  ctx?.clearRect(0, 0, canvas.width, canvas.height);
});