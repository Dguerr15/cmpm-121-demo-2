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

// Add Thin and Thick Marker Buttons
const thinButton = document.createElement("button");
thinButton.textContent = "Thin Marker";
app.appendChild(thinButton);

const thickButton = document.createElement("button");
thickButton.textContent = "Thick Marker";
app.appendChild(thickButton);

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

let drawing: Array<MarkerLine> = [];
let currentPath: MarkerLine | null = null;
let redoStack: Array<MarkerLine> = [];
let isDrawing = false;
let currentThickness = 2;
let toolPreview: ToolPreview | null = null;


// Marker Class
class MarkerLine{
    private points: Array<{x: number; y: number}> = [];
    thickness: number;

    constructor(startX: number, startY: number, thickness:number){
        this.points.push({x: startX, y: startY});
        this.thickness = thickness;
    }

    // add points while dragging
    drag(x: number, y: number){
        this.points.push({x, y});
    }

    // display line
    display(ctx: CanvasRenderingContext2D){
        if (this.points.length < 2) return;
        ctx.beginPath();
        ctx.lineWidth = this.thickness;
        this.points.forEach((point, index) => {
            if (index === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
    }
}

// Tool Preview Class
class ToolPreview {
    private x: number;
    private y: number;
    private thickness: number;

    constructor(x: number, y: number, thickness: number){
        this.x = x;
        this.y = y;
        this.thickness = thickness;
    }
    updatePosition(x: number, y: number){
        this.x = x;
        this.y = y;
    }

    draw(ctx: CanvasRenderingContext2D){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.thickness / 2, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// flag drawing changed
function drawingChanged() {
    const event = new CustomEvent("drawingChanged");
    canvas.dispatchEvent(event);
}

// draw the current drawing
canvas.addEventListener("drawingChanged", () => {
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    drawing.forEach((path) => path.display(ctx!));
    if (!isDrawing && toolPreview) {
        toolPreview.draw(ctx!); // Only draw preview when not drawing
    }
});

// event listeners for drawing
canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    currentPath = new MarkerLine(e.offsetX, e.offsetY, currentThickness);
});

canvas.addEventListener("mousemove", (e) => {
    if (isDrawing && currentPath){
        currentPath.drag(e.offsetX, e.offsetY);
        drawingChanged();
    } else{
        if (!toolPreview) {
            toolPreview = new ToolPreview(e.offsetX, e.offsetY, currentThickness);
        } else {
            toolPreview.updatePosition(e.offsetX, e.offsetY);
        }
        const event = new CustomEvent("tool-moved");
        canvas.dispatchEvent(event);
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

// thin button 
thinButton.addEventListener("click", () => {
    currentThickness = 2;
    thinButton.classList.add("selectedTool");
    thickButton.classList.remove("selectedTool");
});

// thick button 
thickButton.addEventListener("click", () => {
    currentThickness = 6;
    thickButton.classList.add("selectedTool");
    thinButton.classList.remove("selectedTool");
});