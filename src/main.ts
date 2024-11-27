import "./style.css";

const APP_NAME = "Sketch App";
const app = document.querySelector<HTMLDivElement>("#app")!;

// Drawable interface
interface Drawable {
  display(ctx: CanvasRenderingContext2D): void;
}

// This class is used to draw lines on the canvas
class MarkerLine implements Drawable {
  private points: Array<{ x: number; y: number }> = [];
  thickness: number;
  color: string;

  constructor(startX: number, startY: number, thickness: number) {
    this.points.push({ x: startX, y: startY });
    this.thickness = thickness;
    this.color = currentColor;
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
    ctx.strokeStyle = this.color;
    this.points.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
  }
}

// This class is used to preview the tool the user is using on the canvas
class ToolPreview {
  private x: number;
  private y: number;
  private thickness: number;
  private color: string;

  constructor(x: number, y: number, thickness: number, color: string) {
    this.x = x;
    this.y = y;
    this.thickness = thickness;
    this.color = color;
  }
  updatePosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.lineWidth = this.thickness;
    ctx.strokeStyle = this.color;
    ctx.arc(this.x, this.y, this.thickness / 2, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// This class is used to add stickers to the canvas
class StickerCommand implements Drawable {
  private sticker: string;
  private x: number | null = null;
  private y: number | null = null;
  private rotation: number;

  constructor(sticker: string) {
    this.sticker = sticker;
    this.rotation = getRandomRotation();
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
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180); 
      ctx.font = "30px Arial";
      ctx.fillText(this.sticker, 0, 0);
      ctx.restore();
    }
  }
}

// Add containers to style the app
app.style.display = "flex";
app.style.flexDirection = "column";
app.style.alignItems = "center";

// App divided into title banner and main content
const titleBanner = document.createElement("div");
titleBanner.style.width = "100%";
titleBanner.style.textAlign = "center";
app.appendChild(titleBanner);

// Add Title
const title = document.createElement("h1");
title.textContent = APP_NAME;
titleBanner.appendChild(title);

// Main panel divided left and right
const mainPanel = document.createElement("div");
mainPanel.style.width = "100%";
mainPanel.style.display = "flex";
mainPanel.style.flexDirection = "row";
app.appendChild(mainPanel);

// left toolbar for thin/thick buttons
const leftToolbar = document.createElement("div");
leftToolbar.className = "toolbar-left";
leftToolbar.style.width = "200px";
leftToolbar.style.display = "flex";
leftToolbar.style.flexDirection = "column";
leftToolbar.style.justifyContent = "flex-start";
mainPanel.appendChild(leftToolbar);

// under canvas clear, undo, redo
const middleToolbar = document.createElement("div");
middleToolbar.className = "toolbar-middle";
middleToolbar.style.flexDirection = "column";
middleToolbar.style.flexGrow = "1";
mainPanel.appendChild(middleToolbar);

// Add Canvas
const canvas = document.createElement("canvas");
canvas.width = window.innerWidth * 0.3;
canvas.height = window.innerWidth * 0.3;
canvas.style.margin = "0 auto";
canvas.style.display = "block";
middleToolbar.appendChild(canvas);

// right toolbar for stickers
const rightToolbar = document.createElement("div");
rightToolbar.className = "toolbar-right";
rightToolbar.style.width = "200px";
mainPanel.appendChild(rightToolbar);
const rightToolbarGrid = document.createElement("div");
rightToolbarGrid.className = "toolbar-right-grid";
rightToolbar.appendChild(rightToolbarGrid);

// Column for initial stickers
const initialStickersColumn = document.createElement("div");
initialStickersColumn.className = "sticker-column";
rightToolbarGrid.appendChild(initialStickersColumn);

// Column for custom stickers
const customStickersColumn = document.createElement("div");
customStickersColumn.className = "sticker-column";
rightToolbarGrid.appendChild(customStickersColumn);

// Helper function to create buttons
function createButton(
  text: string,
  onClick: () => void,
  container: HTMLElement
): HTMLButtonElement {
  const button = document.createElement("button");
  button.textContent = text;
  button.addEventListener("click", onClick);
  container.appendChild(button);
  return button;
}

// Creates a thin button for the user to select a thin marker
const thinButton = createButton(
  "Thin Marker",
  () => {
    currentThickness = 2;
    currentColor = getRandomColor();
    updateToolSelection();
  },
  leftToolbar
);

// Creates a thick button for the user to select a thick marker
const thickButton = createButton(
  "Thick Marker",
  () => {
    currentThickness = 6;
    currentColor = getRandomColor();
    updateToolSelection();
  },
  leftToolbar
);

// Creates a clear button for the user to clear the canvas
const _clearButton = createButton(
  "Clear Canvas",
  () => {
    clearCanvas();
  },
  middleToolbar
);

// Creates an undo button for the user to undo their last action
const _undoButton = createButton(
  "Undo",
  () => {
    if (drawing.length > 0) {
      redoStack.push(drawing.pop()!);
      drawingChanged();
    }
  },
  middleToolbar
);

// Creates a redo button for the user to redo their last action
const _redoButton = createButton(
  "Redo",
  () => {
    if (redoStack.length > 0) {
      drawing.push(redoStack.pop()!);
      drawingChanged();
    }
  },
  middleToolbar
);

// Creates the main sticker buttons for the user
const stickerButtons = ["😈", "💋", "🍆"];
stickerButtons.forEach((sticker) => {
  createButton(
    sticker,
    () => {
      currentTool = new StickerCommand(sticker);
      fireToolMoved();
      toolPreview = null;
    },
    initialStickersColumn
  );
});

// Lets the user put their own custom stickers
createButton(
  "Custom Sticker",
  () => {
    const sticker = prompt("Enter a custom sticker", "😜");
    if (sticker) {
      stickerButtons.push(sticker);
      createButton(
        sticker,
        () => {
          currentTool = new StickerCommand(sticker);
          fireToolMoved();
          toolPreview = null;
        },
        customStickersColumn
      );
    }
  },
  rightToolbar
);

// Creates a button to export the canvas into a png file for the user
createButton(
  "Export",
  () => {
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = 1024;
    exportCanvas.height = 1024;
    const exportCtx = exportCanvas.getContext("2d")!;
    // scale
    exportCtx.scale(4, 4);
    // redraw everything on new canvas
    drawing.forEach((item) => item.display(exportCtx));
    // convert to url to download
    exportCanvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "sketch.png";
        link.click();
        URL.revokeObjectURL(url);
      }
    }, "image/png");
  },
  middleToolbar
);

// Canvas context
const ctx = canvas.getContext("2d");

let drawing: Array<Drawable> = [];
let currentPath: MarkerLine | null = null;
let redoStack: Array<Drawable> = [];
let isDrawing = false;
let currentThickness = 2;
let toolPreview: ToolPreview | null = null;
let currentTool: Drawable | null = null;
let currentColor: string = getRandomColor();

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

// flag for drawing changed
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
    currentTool.display(ctx!);
  }
}

// get a color
function getRandomColor(): string {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getRandomRotation(): number {
  return Math.floor(Math.random() * 360);
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
    currentPath.color = currentColor;
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
      toolPreview = new ToolPreview(
        e.offsetX,
        e.offsetY,
        currentThickness,
        currentColor
      );
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
  toolPreview = new ToolPreview(0, 0, currentThickness, currentColor);
  fireToolMoved();
}

// Initial setup
updateToolSelection();
