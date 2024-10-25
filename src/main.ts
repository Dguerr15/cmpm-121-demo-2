import "./style.css";

const APP_NAME = "Sketch App";
const app = document.querySelector<HTMLDivElement>("#app")!;

// Drawable interface
interface Drawable {
    display(ctx: CanvasRenderingContext2D): void;
}

// Marker Class
class MarkerLine implements Drawable {
    private points: Array<{ x: number; y: number }> = [];
    thickness: number;

    constructor(startX: number, startY: number, thickness: number) {
        this.points.push({ x: startX, y: startY });
        this.thickness = thickness;
    }

    // add points while dragging
    drag(x: number, y: number) {
        this.points.push({ x, y });
    }

    // display line
    display(ctx: CanvasRenderingContext2D) {
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

    constructor(x: number, y: number, thickness: number) {
        this.x = x;
        this.y = y;
        this.thickness = thickness;
    }
    updatePosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.thickness / 2, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// Sticker Command class
class StickerCommand implements Drawable {
    private sticker: string;
    private x: number | null = null;
    private y: number | null = null;

    constructor(sticker: string) {
        this.sticker = sticker;
    }

    drawPreview(ctx: CanvasRenderingContext2D) {
        if (this.x !== null && this.y !== null) {
            ctx.font = '30px Arial';
            ctx.fillText(this.sticker, this.x, this.y);
        }
    }

    move(x: number, y: number) {
        this.x = x - 15;
        this.y = y + 15;
        drawingChanged();
    }

    place() {
        if (this.x !== null && this.y !== null) {
            drawing.push(this);
            drawingChanged();
        }
    }

    display(ctx: CanvasRenderingContext2D) {
        if (this.x !== null && this.y !== null) {
            ctx.font = "30px Arial";
            ctx.fillText(this.sticker, this.x, this.y);
        }
    }
}

// Add Title
const title = document.createElement("h1");
title.textContent = APP_NAME;
app.appendChild(title);

// Add Canvas
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

// Add a Clear Canvas Button
const clearButton = document.createElement("button");
clearButton.textContent = "Clear Canvas";
app.appendChild(clearButton);

// Add an Undo Button
const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
app.appendChild(undoButton);

// Add a Redo Button
const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
app.appendChild(redoButton);

// Sticker Button Setup
const stickerButtons = ['🐶', '🌟', '🍕'];
stickerButtons.forEach(sticker => {
    const button = document.createElement('button');
    button.textContent = sticker;
    button.addEventListener('click', () => {
        currentTool = new StickerCommand(sticker);
        fireToolMoved();
        toolPreview = null;
    });
    app.appendChild(button);
});

// Canvas context
const ctx = canvas.getContext("2d");

let drawing: Array<Drawable> = [];
let currentPath: MarkerLine | null = null;
let redoStack: Array<Drawable> = [];
let isDrawing = false;
let currentThickness = 2;
let toolPreview: ToolPreview | null = null;
let currentTool: Drawable | null = null;

// Tool-moved event dispatcher
function fireToolMoved() {
    const event = new CustomEvent("tool-moved");
    canvas.dispatchEvent(event);
}

// Flag drawing changed
function drawingChanged() {
    const event = new CustomEvent("drawingChanged");
    canvas.dispatchEvent(event);
}

// Draw the current drawing
canvas.addEventListener("drawingChanged", () => {
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    drawing.forEach((item) => item.display(ctx!));
    if (isDrawing && currentPath) {
        currentPath.display(ctx!);
    } else if (toolPreview && !(currentTool instanceof StickerCommand)) {
        toolPreview.draw(ctx!);
    } else if (currentTool instanceof StickerCommand) {
        currentTool.drawPreview(ctx!);
    }
});

// Updated tool preview on tool-moved
canvas.addEventListener("tool-moved", () => {
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    drawing.forEach((path) => path.display(ctx!));

    if (toolPreview && !(currentTool instanceof StickerCommand)) {
        toolPreview.draw(ctx!);
    }

    if (currentTool instanceof StickerCommand) {
        currentTool.drawPreview(ctx!);
    }
});

// Event listeners for drawing
canvas.addEventListener("mousedown", (e) => {
    if (currentTool instanceof StickerCommand) {
        currentTool.move(e.offsetX, e.offsetY);
    } else {
        isDrawing = true;
        currentPath = new MarkerLine(e.offsetX, e.offsetY, currentThickness);
    }
});

canvas.addEventListener("mousemove", (e) => {
    if (isDrawing && currentPath) {
        currentPath.drag(e.offsetX, e.offsetY);
        drawingChanged();
    } else if (currentTool instanceof StickerCommand) {
        currentTool.move(e.offsetX, e.offsetY);
        drawingChanged();
    } else {
        if (!toolPreview) {
            toolPreview = new ToolPreview(e.offsetX, e.offsetY, currentThickness);
        } else {
            toolPreview.updatePosition(e.offsetX, e.offsetY);
        }
        fireToolMoved();
        drawingChanged();
    }
});

canvas.addEventListener("mouseup", () => {
    if (isDrawing && currentPath) {
        drawing.push(currentPath);
        currentPath = null;
        isDrawing = false;
        redoStack = [];
        drawingChanged();
    } else if (currentTool instanceof StickerCommand) {
        currentTool.place();
        currentTool = null;
    }
});

canvas.addEventListener("mouseout", () => {
    if (isDrawing && currentPath) {
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

// Undo button
undoButton.addEventListener("click", () => {
    if (drawing.length > 0) {
        redoStack.push(drawing.pop()!);
        drawingChanged();
    }
});

// Redo button
redoButton.addEventListener("click", () => {
    if (redoStack.length > 0) {
        drawing.push(redoStack.pop()!);
        drawingChanged();
    }
});

// Thin button
thinButton.addEventListener("click", () => {
    currentThickness = 2;
    thinButton.classList.add("selectedTool");
    thickButton.classList.remove("selectedTool");

    currentTool = null;
    toolPreview = new ToolPreview(0, 0, currentThickness);
    fireToolMoved();
});

// Thick button
thickButton.addEventListener("click", () => {
    currentThickness = 6;
    thickButton.classList.add("selectedTool");
    thinButton.classList.remove("selectedTool");

    currentTool = null;
    toolPreview = new ToolPreview(0, 0, currentThickness);
    fireToolMoved();
});
