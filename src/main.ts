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
let drawing: Array<Array<{x: number; y: number}>> = [];
let currentPath: Array<{x: number; y: number}> = [];
let isDrawing = false;

// flag drawing changed
function drawingChanged() {
    const event = new CustomEvent("drawingChanged");
    canvas.dispatchEvent(event);
}

// draw the current drawing
canvas.addEventListener("drawingChanged", () => {
    ctx?.beginPath();
    for (let i = 0; i < currentPath.length; i++) {
        const point = currentPath[i];
        if (i === 0) {
            ctx?.moveTo(point.x, point.y);
        } else {
            ctx?.lineTo(point.x, point.y);
        }
    } 
    ctx?.stroke();
});

// event listeners for drawing
canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    currentPath = [];
    currentPath.push({x: e.offsetX, y: e.offsetY});
});

canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) {
        currentPath.push({x: e.offsetX, y: e.offsetY});
        drawingChanged();
    }
});

canvas.addEventListener("mouseup", () => {
    if (isDrawing){
        drawing.push(currentPath);
        currentPath = [];
        isDrawing = false;
    }  
});

canvas.addEventListener("mouseout", () => {
    if (isDrawing){
        drawing.push(currentPath);
        currentPath = [];
        isDrawing = false;
    }
});

// Clear button
clearButton.addEventListener("click", () => {
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    drawing = [];
});