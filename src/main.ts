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

// Helper function to create buttons
function createButton(text: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement("button");
    button.textContent = text;
    button.addEventListener("click", onClick);
    app.appendChild(button);
    return button;
}

// Add Canvas
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
// center the canvas above buttons
canvas.style.margin = "0 auto";
canvas.style.display = "block";

app.appendChild(canvas);

// Button Creation
const thinButton = createButton("Thin Marker", () => {
    currentThickness = 2;
    updateToolSelection();
});

const thickButton = createButton("Thick Marker", () => {
    currentThickness = 6;
    updateToolSelection();
});

const _clearButton = createButton("Clear Canvas", () => {
    clearCanvas();
});

const _undoButton = createButton("Undo", () => {
    if (drawing.length > 0) {
        redoStack.push(drawing.pop()!);
        drawingChanged();
    }
});

const _redoButton = createButton("Redo", () => {
    if (redoStack.length > 0) {
        drawing.push(redoStack.pop()!);
        drawingChanged();
    }
});

// Sticker Button Setup
const stickerButtons = ['🐶', '🌟', '🍕'];
stickerButtons.forEach(sticker => {
    createButton(sticker, () => {
        currentTool = new StickerCommand(sticker);
        fireToolMoved();
        toolPreview = null;
    });
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

// Clear canvas function
function clearCanvas() {
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    drawing = [];
    redoStack = [];
}

// Flag drawing changed
function drawingChanged() {
    const event = new CustomEvent("drawingChanged");
    canvas.dispatchEvent(event);
}

// Draw the current drawing
function drawCanvas() {
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    drawing.forEach((item) => item.display(ctx!));
    if (isDrawing && currentPath) {
        currentPath.display(ctx!);
    } else if (toolPreview && !(currentTool instanceof StickerCommand)) {
        toolPreview.draw(ctx!);
    } else if (currentTool instanceof StickerCommand) {
        currentTool.drawPreview(ctx!);
    }
}

// Updated tool preview on tool-moved
canvas.addEventListener("tool-moved", drawCanvas);

// Drawing changed listener
canvas.addEventListener("drawingChanged", drawCanvas);

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

// Function to update tool selection visuals
function updateToolSelection() {
    thinButton.classList.toggle("selectedTool", currentThickness === 2);
    thickButton.classList.toggle("selectedTool", currentThickness === 6);
    currentTool = null;
    toolPreview = new ToolPreview(0, 0, currentThickness);
    fireToolMoved();
}

// Initial setup
updateToolSelection();
