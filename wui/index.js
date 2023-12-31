function getMousePosition(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
  };
}

document.addEventListener("DOMContentLoaded", function () {
  let fleetingNoteCount = 3;
  let needsRedraw = true;

  const canvas = document.getElementById("myCanvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  canvas.addEventListener('mousemove', function(evt) {
    needsRedraw = true;
    var mousePos = getMousePosition(canvas, evt);
    wui.setMouseState({ x: mousePos.x, y: mousePos.y });

    /*
    if (mouseIsDown) {
        // Handle mouse drag
    }
    */
  });

  canvas.addEventListener('mousedown', () => {
    needsRedraw = true;
    wui.setMouseState({ isMouseDown: true });
  });

  canvas.addEventListener('mouseup', () => {
    needsRedraw = true;
    wui.setMouseState({ isMouseDown: false });
  });

  const wui = window.wui;
  wui.init(canvas);

  const noteGradient = wui.gradients.createLinear(0, 0, 0, 550, [
    [0, "#F7FAFE"],
    [0.5, "#EBECF4"],
    [1, "#D3CDCB"],
  ]);
  const noteBorderGradient = wui.gradients.createLinear(30, 30, 650, 450, [
    [0, "#FFFFFF"],
    [0.5, "#FFFFFF"],
    [0.51, "#BB9987"],
  ]);
  const bgGradient = wui.gradients.createLinear(
    canvas.width / 2,
    0,
    canvas.width / 2,
    canvas.height,
    [
      [0, "#A69E9A"],
      [1, "#867373"],
    ]
  );

  function draw() {
    if (!needsRedraw) {
      requestAnimationFrame(draw);
      return;
    }

    needsRedraw = false;
    wui.begin();
    wui.drawRect(0, 0, canvas.width, canvas.height, bgGradient);

    {
      wui.enableShadows({
        color: "#352227",
        blur: 50,
        offsetX: 30,
        offsetY: 30,
      });
      wui.drawRoundedRect(50, 50, 400, 600, 40, { colorStyle: noteGradient });

      wui.disableShadows();
      wui.drawText("Fleeting Notes", 250, 70, {
        font: "28px serif",
        textAlign: "center",
        textBaseline: "top",
      });

      wui.drawLine(50, 114, 450, 114, 2, "#C7BEBC");
      wui.drawLine(50, 116, 450, 116, 1, "#FFFFFE");

      wui.drawText(`You have ${fleetingNoteCount} fleeting notes`, 70, 150, {
        font: "16px sans-serif",
      });
      wui.drawLine(50, 172, 450, 172, 2, "#C7BEBC");
      wui.drawLine(50, 174, 450, 174, 1, "#FFFFFE");

      wui.drawRoundedRect(50, 50, 400, 600, 40, {
        colorStyle: noteBorderGradient,
        isFilled: false,
        lineWidth: 2,
      });
    }

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
    requestAnimationFrame(draw);
  }

  // Start the drawing loop
  draw();
});
