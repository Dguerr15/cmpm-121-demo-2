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

// add an undo button
const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
app.appendChild(undoButton);

// add a redo button
const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
app.appendChild(redoButton);

// canvas context
const ctx = canvas.getContext("2d");

// Marker Class
class MarkerLine{
    private points: Array<{x: number; y: number}> = [];

    constructor(startX: number, startY: number){
        this.points.push({x: startX, y: startY});
    }

    // add points while dragging
    drag(x: number, y: number){
        this.points.push({x, y});
    }

    // display line
    display(ctx: CanvasRenderingContext2D){
        if (this.points.length < 2) return;
        ctx.beginPath();
        this.points.forEach((point, index) => {
            if (index === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
    }
}

let drawing: Array<MarkerLine> = [];
let currentPath: MarkerLine | null = null;
let redoStack: Array<MarkerLine> = [];
let isDrawing = false;

// flag drawing changed
function drawingChanged() {
    const event = new CustomEvent("drawingChanged");
    canvas.dispatchEvent(event);
}

// draw the current drawing
canvas.addEventListener("drawingChanged", () => {
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    drawing.forEach((path) => path.display(ctx!));
});

// event listeners for drawing
canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    currentPath = new MarkerLine(e.offsetX, e.offsetY);
});

canvas.addEventListener("mousemove", (e) => {
    if (isDrawing && currentPath){
        currentPath.drag(e.offsetX, e.offsetY);
        drawingChanged();
    }
});

canvas.addEventListener("mouseup", () => {
    if (isDrawing && currentPath){
        drawing.push(currentPath);
        currentPath = null;
        isDrawing = false;
        redoStack = [];
        drawingChanged();
    }  
});

canvas.addEventListener("mouseout", () => {
    if (isDrawing && currentPath){
        drawing.push(currentPath);
        currentPath = null;
        isDrawing = false;
        redoStack = [];
    }
});

// Clear button
clearButton.addEventListener("click", () => {
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    drawing = [];
    redoStack = [];
});

// undo button
undoButton.addEventListener("click", () => {
    if (drawing.length > 0) {
        redoStack.push(drawing.pop()!);
        drawingChanged();
    }
});

// redo button
redoButton.addEventListener("click", () => {
    if (redoStack.length > 0) {
        drawing.push(redoStack.pop()!);
        drawingChanged();
    }
});