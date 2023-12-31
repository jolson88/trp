let ctx = undefined;
let width = 1280;
let height = 720;

const state = {
  mouseX: 0,
  mouseY: 0,
  mouseDown: false,

  hotId: "",
  activeId: "",
};

function init(canvas) {
  ctx = canvas.getContext("2d");
  width = canvas.width;
  height = canvas.height;
}

function begin() {
  state.hotId = "";

  ctx.clearRect(0, 0, width, height);
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";

  disableShadows();
}

function end() {
  if (!state.mouseDown) {
    state.activeId = "";
  }
}

function setMousePosition(x, y) {
  state.mouseX = x;
  state.mouseY = y;
}

function setMouseDown() {
  state.mouseDown = true;
}

function setMouseUp() {
  state.mouseDown = false;
}

function inRegion(x, y, width, height) {
  return !(
    state.mouseX < x ||
    state.mouseY < y ||
    state.mouseX > x + width ||
    state.mouseY > y + height
  );
}

function doButton(id, text, x, y, { width = 150, height = 30, font = "14px sans-serif" } = {}) {
  if (inRegion(x, y, width, height)) {
    state.hotId = id;
    if (state.activeId === "" && state.mouseDown) {
      state.activeId = id;
    }
  }
  const hotAndActive = state.hotId === id && state.activeId === id;

  enableShadows({
    offsetX: hotAndActive ? 0 : 2,
    offsetY: hotAndActive ? 0 : 2,
    blur: 1,
  });
  drawRoundedRect(
    x + (hotAndActive ? 1 : 0),
    y + (hotAndActive ? 1 : 0),
    width,
    height,
    height / 2,
    { colorStyle: "#6B7C9B" }
  );

  disableShadows();
  drawText(
    text,
    x + (hotAndActive ? 1 : 0) + width / 2,
    y + (hotAndActive ? 1 : 0) + height / 2,
    {
      colorStyle: "#FFFFFF",
      font,
      textAlign: "center",
      textBaseline: "middle",
    }
  );

  return !state.mouseDown && hotAndActive;
}

function createLinear(x1, y1, x2, y2, stops) {
  const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  stops.forEach((stop) => gradient.addColorStop(stop[0], stop[1]));
  return gradient;
}

function enableShadows({
  offsetX = 5,
  offsetY = 5,
  blur = 10,
  color = "rgba(0, 0, 0, 0.8)",
}) {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetX = offsetX;
  ctx.shadowOffsetY = offsetY;
}

function disableShadows() {
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

function drawLine(x1, y1, x2, y2, width, colorStyle) {
  ctx.lineWidth = width;
  ctx.strokeStyle = colorStyle;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawRect(x, y, width, height, colorStyle) {
  ctx.fillStyle = colorStyle;
  ctx.fillRect(x, y, width, height);
}

function drawRoundedRect(
  x,
  y,
  width,
  height,
  radii,
  { colorStyle = "gray", isFilled = true, lineWidth = 1 } = {}
) {
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radii);

  if (isFilled) {
    ctx.fillStyle = colorStyle;
    ctx.fill();
    return;
  }

  ctx.strokeStyle = colorStyle;
  ctx.stroke();
}

function drawText(
  text,
  x,
  y,
  {
    colorStyle = "black",
    font = "16px serif",
    textAlign = "start",
    textBaseline = "alphabetic",
    isFilled = true,
  } = {}
) {
  ctx.font = font;
  ctx.textAlign = textAlign;
  ctx.textBaseline = textBaseline;

  if (isFilled) {
    ctx.fillStyle = colorStyle;
    ctx.fillText(text, x, y);
    return;
  }

  ctx.strokeStyle = colorStyle;
  ctx.strokeText(text, x, y);
}

window.wui = {
  begin,
  disableShadows,
  doButton,
  drawLine,
  drawRect,
  drawRoundedRect,
  drawText,
  enableShadows,
  end,
  gradients: {
    createLinear,
  },
  init,
  setMousePosition,
  setMouseDown,
  setMouseUp,
};
