let wui = undefined;
let canvas = undefined;

let fleetingNoteCount = 5;
let bgGradient = undefined;

function initialize() {
  canvas = document.getElementById("myCanvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  wui = window.wui;
  wui.init(canvas);

  canvas.addEventListener("mousemove", function (evt) {
    var mousePos = getMousePosition(canvas, evt);
    wui.setMousePosition(mousePos.x, mousePos.y);
  });
  canvas.addEventListener("mousedown", wui.setMouseDown);
  canvas.addEventListener("mouseup", wui.setMouseUp);

  bgGradient = wui.gradients.createLinear(
    canvas.width / 2,
    0,
    canvas.width / 2,
    canvas.height,
    [
      [0, "#A69E9A"],
      [1, "#867373"],
    ]
  );
}

function getMousePosition(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}

function update() {
  draw();
  requestAnimationFrame(update);
}

function draw() {
  wui.begin({ clearStyle: bgGradient });

  let x = 50;
  let y = 50;
  const width = 400;
  const height = 600;
  if (wui.doWindow("fleetingNotes", x, y, { width,height, title: "Fleeting Notes" })) {
    y += 65;
    wui.drawText(`You have ${fleetingNoteCount} fleeting notes`, x + 20, y + 35, {
      font: "16px sans-serif",
    });
    if (wui.doButton("newNote", "\u2295", x + width - 60, y + 10, { width: 36, height: 36, font: "34px sans-serif" })) {
      fleetingNoteCount++;
    }
    wui.drawLine(x, y + 65, x + width, y + 65, 2, "#C7BEBC");
    wui.drawLine(x, y + 65 + 2, x + width, y + 65 + 2, 1, "#FFFFFE");

    y += 100;
    wui.drawText("🗓", x + width - 24, y + 10, {
      font: "36px sans-serif",
      textAlign: "end",
      textBaseline: "middle",
    });
    wui.drawText("2 days old", x + width - 75, y + 10, {
      colorStyle: "#978E8C",
      font: "italic 16px sans-serif",
      textAlign: "end",
      textBaseline: "middle",
    });
    wui.drawText("A vital element of thinking critically is being able to identify framing, assertions, and assumptions being made behind an argument. This is even more important than knowledge because without it, we can't apply the knowledge we've gained in the first place.",
      x + 30,
      y + 60,
      {
        colorStyle: "#3D1610",
        font: "16px sans-serif",
        maxWidth: width - 60,
      }
    );
  }

  wui.disableShadows();
  wui.drawText("Secain", 20, canvas.height - 10, {
    colorStyle: "#C1B8B7",
    font: "82px sans-serif",
    textAlign: "start",
    textBaseline: "bottom",
    isFilled: false,
  });
  wui.drawText(
    "THE REASONABLE PROGRAMMER",
    canvas.width - 20,
    canvas.height - 20,
    {
      colorStyle: "#C1B8B7",
      font: "24px sans-serif",
      textAlign: "end",
      textBaseline: "bottom",
      isFilled: false,
    }
  );

  wui.end();
}

document.addEventListener("DOMContentLoaded", function () {
  initialize();
  update();
});
