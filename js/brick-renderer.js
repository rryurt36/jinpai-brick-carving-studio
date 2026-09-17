(function () {
  "use strict";

  const MATERIAL_WIDTH = 1000;
  const MATERIAL_HEIGHT = 700;
  const GRID_COLUMNS = 42;
  const GRID_ROWS = 30;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(a, b, amount) {
    return a + (b - a) * amount;
  }

  function distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function createCanvas(width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  function quadPath(ctx, points) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i += 1) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
  }

  class BrickRenderer {
    constructor(canvas, patternModel) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.model = patternModel;
      this.width = 1;
      this.height = 1;
      this.dpr = 1;
      this.brickId = "premium";
      this.orientation = { yaw: -.12, pitch: -.045 };
      this.orientationTarget = { yaw: -.12, pitch: -.045 };
      this.viewBounds = { yaw: .65, pitch: .28 };
      this.lineTransform = { x: 0, y: 0, scale: .91 };
      this.step = 0;
      this.tool = null;
      this.finishingTool = null;
      this.surfaceDirty = true;
      this.surfaceClock = 0;
      this.lastPointer = null;
      this.cracks = [];
      this.dust = [];
      this.dustSeed = 0;
      this.lastDustTime = 0;
      this.roughCoverage = new Uint8Array(GRID_COLUMNS * GRID_ROWS);
      this.fineCoverage = new Uint8Array(GRID_COLUMNS * GRID_ROWS);
      this.edgeCoverage = new Uint8Array(GRID_COLUMNS * GRID_ROWS);
      this.polishCoverage = new Uint8Array(GRID_COLUMNS * GRID_ROWS);
      this.cleanCoverage = new Uint8Array(GRID_COLUMNS * GRID_ROWS);
      this.fineLoad = new Map();
      this.requiredCells = {
        rough: 1,
        fine: 1,
        edge: 1,
        polish: 1,
        clean: 1
      };

      this.surfaceCanvas = createCanvas(MATERIAL_WIDTH, MATERIAL_HEIGHT);
      this.surfaceCtx = this.surfaceCanvas.getContext("2d");
      this.roughCanvas = createCanvas(MATERIAL_WIDTH, MATERIAL_HEIGHT);
      this.roughCtx = this.roughCanvas.getContext("2d");
      this.fineCanvas = createCanvas(MATERIAL_WIDTH, MATERIAL_HEIGHT);
      this.fineCtx = this.fineCanvas.getContext("2d");
      this.reliefSource = createCanvas(260, 182);
      this.reliefSourceCtx = this.reliefSource.getContext("2d");
      this.reliefCanvas = createCanvas(520, 364);
      this.reliefCanvasCtx = this.reliefCanvas.getContext("2d");
      this.brickTexture = null;
      this.smoothTexture = null;
      this.roughTexture = null;
      this.allowedMasks = {};

      this.buildTextures();
      this.buildAllowedMasks();
      this.buildDepthRelief();
      this.calculateRequiredCells();
      this.resize();
      this.rebuildSurface(true);
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      this.width = Math.max(1, rect.width);
      this.height = Math.max(1, rect.height);
      this.dpr = Math.min(2, window.devicePixelRatio || 1);
      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.surfaceDirty = true;
    }

    setStep(step) {
      this.step = step;
      this.surfaceDirty = true;
    }

    setTool(tool) {
      this.tool = tool;
    }

    setFinishingTool(tool) {
      this.finishingTool = tool;
    }

    setBrick(brickId) {
      if (this.brickId === brickId) {
        return;
      }
      this.brickId = brickId;
      this.buildTextures();
      this.rebuildSurface(true);
    }

    setLineTransform(transform) {
      this.lineTransform.x = transform.x;
      this.lineTransform.y = transform.y;
      this.lineTransform.scale = transform.scale;
      this.surfaceDirty = true;
    }

    setViewBounds(yaw, pitch) {
      this.viewBounds.yaw = yaw;
      this.viewBounds.pitch = pitch;
      this.orientationTarget.yaw = clamp(this.orientationTarget.yaw, -yaw, yaw);
      this.orientationTarget.pitch = clamp(this.orientationTarget.pitch, -pitch, pitch);
    }

    setOrientation(yaw, pitch, immediate) {
      this.orientationTarget.yaw = clamp(yaw, -this.viewBounds.yaw, this.viewBounds.yaw);
      this.orientationTarget.pitch = clamp(pitch, -this.viewBounds.pitch, this.viewBounds.pitch);
      if (immediate) {
        this.orientation.yaw = this.orientationTarget.yaw;
        this.orientation.pitch = this.orientationTarget.pitch;
      }
    }

    rotateBy(dx, dy) {
      this.setOrientation(
        this.orientationTarget.yaw + dx * .0062,
        this.orientationTarget.pitch - dy * .0045,
        false
      );
    }

    resetView() {
      this.setOrientation(-.12, -.045, false);
    }

    buildTextures() {
      this.brickTexture = createCanvas(MATERIAL_WIDTH, MATERIAL_HEIGHT);
      this.smoothTexture = createCanvas(MATERIAL_WIDTH, MATERIAL_HEIGHT);
      this.roughTexture = createCanvas(MATERIAL_WIDTH, MATERIAL_HEIGHT);

      const brickCtx = this.brickTexture.getContext("2d");
      const smoothCtx = this.smoothTexture.getContext("2d");
      const roughCtx = this.roughTexture.getContext("2d");
      const baseImage = brickCtx.createImageData(MATERIAL_WIDTH, MATERIAL_HEIGHT);
      const smoothImage = smoothCtx.createImageData(MATERIAL_WIDTH, MATERIAL_HEIGHT);
      const roughImage = roughCtx.createImageData(MATERIAL_WIDTH, MATERIAL_HEIGHT);

      let seed = this.brickId === "premium" ? 1789 : 9231;
      function random() {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      }

      for (let y = 0; y < MATERIAL_HEIGHT; y += 1) {
        for (let x = 0; x < MATERIAL_WIDTH; x += 1) {
          const index = (y * MATERIAL_WIDTH + x) * 4;
          const fineNoise = (random() - .5) * 18;
          const broadNoise =
            Math.sin(x * .021 + Math.sin(y * .014) * 2.4) * 3.2 +
            Math.sin((x + y) * .008) * 2.4;
          const centerLight = 1 - Math.min(1, Math.hypot(x - 500, y - 350) / 760) * .11;
          const base = 108 + fineNoise + broadNoise;
          baseImage.data[index] = clamp(base * .93 * centerLight, 52, 148);
          baseImage.data[index + 1] = clamp(base * .96 * centerLight, 54, 154);
          baseImage.data[index + 2] = clamp(base * .91 * centerLight, 48, 144);
          baseImage.data[index + 3] = 255;

          const smoothNoise = (random() - .5) * 7;
          smoothImage.data[index] = clamp(126 + smoothNoise + broadNoise * .25, 98, 153);
          smoothImage.data[index + 1] = clamp(128 + smoothNoise + broadNoise * .25, 100, 156);
          smoothImage.data[index + 2] = clamp(121 + smoothNoise + broadNoise * .25, 93, 150);
          smoothImage.data[index + 3] = 255;

          const pore = random();
          const roughValue = pore > .965 ? -58 : pore > .91 ? -24 : (random() - .5) * 32;
          roughImage.data[index] = clamp(137 + roughValue, 64, 184);
          roughImage.data[index + 1] = clamp(135 + roughValue, 62, 181);
          roughImage.data[index + 2] = clamp(127 + roughValue, 57, 174);
          roughImage.data[index + 3] = 255;
        }
      }

      brickCtx.putImageData(baseImage, 0, 0);
      smoothCtx.putImageData(smoothImage, 0, 0);
      roughCtx.putImageData(roughImage, 0, 0);

      const sideGradient = brickCtx.createLinearGradient(0, 0, MATERIAL_WIDTH, MATERIAL_HEIGHT);
      sideGradient.addColorStop(0, "rgba(255,255,255,.09)");
      sideGradient.addColorStop(.48, "rgba(255,255,255,.01)");
      sideGradient.addColorStop(1, "rgba(36,32,28,.13)");
      brickCtx.fillStyle = sideGradient;
      brickCtx.fillRect(0, 0, MATERIAL_WIDTH, MATERIAL_HEIGHT);

      for (let i = 0; i < 2100; i += 1) {
        const x = random() * MATERIAL_WIDTH;
        const y = random() * MATERIAL_HEIGHT;
        const radius = random() * 1.9 + .25;
        const shade = random() > .55 ? "48,45,40" : "210,205,193";
        brickCtx.fillStyle = "rgba(" + shade + "," + (.025 + random() * .05) + ")";
        brickCtx.beginPath();
        brickCtx.arc(x, y, radius, 0, Math.PI * 2);
        brickCtx.fill();
      }

      if (this.brickId === "flawed") {
        this.drawInitialFlaw(brickCtx, random);
      }
    }

    drawInitialFlaw(ctx, random) {
      for (let line = 0; line < 4; line += 1) {
        const startX = 110 + random() * 760;
        const startY = 70 + random() * 540;
        ctx.save();
        ctx.strokeStyle = "rgba(52,43,37,.38)";
        ctx.lineWidth = .8 + random() * 1.2;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        let x = startX;
        let y = startY;
        for (let i = 0; i < 7; i += 1) {
          x += (random() - .42) * 30;
          y += (random() - .28) * 20;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      }
    }

    buildAllowedMasks() {
      const maskCanvas = this.model.getCanvas("mask");
      const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
      const source = maskCtx.getImageData(0, 0, MATERIAL_WIDTH, MATERIAL_HEIGHT).data;

      function buildFor(type) {
        const canvas = createCanvas(MATERIAL_WIDTH, MATERIAL_HEIGHT);
        const ctx = canvas.getContext("2d");
        const output = ctx.createImageData(MATERIAL_WIDTH, MATERIAL_HEIGHT);
        for (let i = 0; i < source.length; i += 4) {
          const value = source[i];
          let keep = false;
          if (type === "rough") {
            keep = value < 145;
          } else if (type === "fine") {
            keep = value > 222;
          } else if (type === "outline") {
            keep = value > 145;
          }
          output.data[i] = 255;
          output.data[i + 1] = 255;
          output.data[i + 2] = 255;
          output.data[i + 3] = keep ? 255 : 0;
        }
        ctx.putImageData(output, 0, 0);
        return canvas;
      }

      this.allowedMasks.rough = buildFor("rough");
      this.allowedMasks.fine = buildFor("fine");
      this.allowedMasks.outline = buildFor("outline");
    }

    buildDepthRelief() {
      this.depthReliefCanvas = createCanvas(MATERIAL_WIDTH, MATERIAL_HEIGHT);
      const ctx = this.depthReliefCanvas.getContext("2d");
      ctx.drawImage(this.model.getCanvas("depth"), 0, 0);
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(this.allowedMasks.fine, 0, 0);
      ctx.globalCompositeOperation = "source-over";
    }

    calculateRequiredCells() {
      const required = {
        rough: 0,
        fine: 0,
        edge: 0,
        polish: 0,
        clean: 0
      };

      for (let row = 0; row < GRID_ROWS; row += 1) {
        for (let column = 0; column < GRID_COLUMNS; column += 1) {
          const x = (column + .5) / GRID_COLUMNS * MATERIAL_WIDTH;
          const y = (row + .5) / GRID_ROWS * MATERIAL_HEIGHT;
          const area = this.model.sampleMask(x, y);
          if (area.type === "background") {
            required.rough += 1;
            required.polish += 1;
          }
          if (area.type === "subject") {
            required.fine += 1;
            required.polish += 1;
            required.clean += 1;
          }
          if (area.type === "border") {
            required.polish += 1;
            required.clean += 1;
          }
          if (area.type !== "background") {
            const edgeDistance = 9;
            const nearEdge = [
              [edgeDistance, 0],
              [-edgeDistance, 0],
              [0, edgeDistance],
              [0, -edgeDistance]
            ].some((offset) => {
              const neighbor = this.model.sampleMask(x + offset[0], y + offset[1]);
              return neighbor.type !== area.type;
            });
            if (nearEdge) {
              required.edge += 1;
            }
          }
        }
      }

      this.requiredCells = required;
    }

    getGeometry() {
      const yaw = this.orientation.yaw;
      const pitch = this.orientation.pitch;
      const cosYaw = Math.cos(yaw);
      const absCos = Math.max(.12, Math.abs(cosYaw));
      const baseWidth = Math.min(this.width * .79, this.height * 1.48, 910);
      const baseHeight = baseWidth * .7;
      const faceWidth = baseWidth * absCos;
      const faceHeight = baseHeight * Math.cos(pitch);
      const centerX = this.width * .515;
      const centerY = this.height * .535;
      const topShift = Math.sin(pitch) * 21;
      const sideDepth = Math.min(48, faceWidth * .075) * Math.abs(Math.sin(yaw));
      const depthDirection = cosYaw >= 0 ? 1 : -1;
      const left = centerX - faceWidth / 2;
      const right = centerX + faceWidth / 2;
      const top = centerY - faceHeight / 2;
      const bottom = centerY + faceHeight / 2;
      const points = [
        { x: left + topShift * .2, y: top + topShift },
        { x: right + topShift * .2, y: top - topShift },
        { x: right - topShift * .2, y: bottom - topShift },
        { x: left - topShift * .2, y: bottom + topShift }
      ];

      return {
        yaw,
        pitch,
        cosYaw,
        absCos,
        baseWidth,
        baseHeight,
        faceWidth,
        faceHeight,
        centerX,
        centerY,
        left,
        right,
        top,
        bottom,
        topShift,
        sideDepth,
        depthDirection,
        points,
        frontVisible: cosYaw >= 0
      };
    }

    screenToMaterial(point) {
      const geometry = this.getGeometry();
      return {
        x: (point.x - geometry.left) / Math.max(1, geometry.faceWidth) * MATERIAL_WIDTH,
        y: (point.y - geometry.top) / Math.max(1, geometry.faceHeight) * MATERIAL_HEIGHT
      };
    }

    materialToModel(point) {
      const transform = this.lineTransform;
      return {
        x: 500 + (point.x - 500 - transform.x) / transform.scale,
        y: 350 + (point.y - 350 - transform.y) / transform.scale
      };
    }

    screenToModel(point) {
      return this.materialToModel(this.screenToMaterial(point));
    }

    pointInsideFace(point) {
      const material = this.screenToMaterial(point);
      return material.x >= 0 && material.x <= MATERIAL_WIDTH && material.y >= 0 && material.y <= MATERIAL_HEIGHT;
    }

    polygonCentroid(points) {
      const result = { x: 0, y: 0 };
      points.forEach(function (point) {
        result.x += point.x;
        result.y += point.y;
      });
      result.x /= points.length;
      result.y /= points.length;
      return result;
    }

    invalidateSurface() {
      this.surfaceDirty = true;
    }

    polygonSkin() {
      this.dust = [];
      this.cracks = [];
      this.roughCtx.clearRect(0, 0, MATERIAL_WIDTH, MATERIAL_HEIGHT);
      this.fineCtx.clearRect(0, 0, MATERIAL_WIDTH, MATERIAL_HEIGHT);
      this.roughCoverage.fill(0);
      this.fineCoverage.fill(0);
      this.edgeCoverage.fill(0);
      this.polishCoverage.fill(0);
      this.cleanCoverage.fill(0);
      this.fineLoad.clear();
      this.surfaceDirty = true;
    }

    resetToolProgress(tool) {
      if (tool === "sand") {
        this.setSandProgress(0);
        return;
      }
      if (tool === "rough") {
        this.roughCtx.clearRect(0, 0, MATERIAL_WIDTH, MATERIAL_HEIGHT);
        this.roughCoverage.fill(0);
      } else if (tool === "fine") {
        this.fineCtx.clearRect(0, 0, MATERIAL_WIDTH, MATERIAL_HEIGHT);
        this.fineCoverage.fill(0);
        this.fineLoad.clear();
        this.cracks = [];
      } else if (tool === "edge") {
        this.edgeCoverage.fill(0);
      } else if (tool === "polish") {
        this.polishCoverage.fill(0);
      } else if (tool === "brush") {
        this.cleanCoverage.fill(0);
        this.dust = [];
      }
      this.surfaceDirty = true;
    }

    completeToolProgress(tool) {
      if (tool === "sand") {
        this.setSandProgress(1);
        return;
      }

      if (tool === "rough") {
        const ctx = this.roughCtx;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, MATERIAL_WIDTH, MATERIAL_HEIGHT);

        const carved = ctx.createLinearGradient(0, 0, MATERIAL_WIDTH, MATERIAL_HEIGHT);
        carved.addColorStop(0, "#26231f");
        carved.addColorStop(.48, "#35312c");
        carved.addColorStop(1, "#201e1b");
        ctx.fillStyle = carved;
        ctx.fillRect(0, 0, MATERIAL_WIDTH, MATERIAL_HEIGHT);

        for (let y = 30; y < MATERIAL_HEIGHT; y += 34) {
          ctx.strokeStyle = y % 68 === 30 ? "rgba(218,208,190,.055)" : "rgba(20,18,16,.13)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.bezierCurveTo(
            MATERIAL_WIDTH * .25,
            y + Math.sin(y * .035) * 11,
            MATERIAL_WIDTH * .72,
            y - Math.cos(y * .028) * 9,
            MATERIAL_WIDTH,
            y + Math.sin(y * .02) * 7
          );
          ctx.stroke();
        }

        ctx.globalCompositeOperation = "destination-in";
        ctx.drawImage(this.allowedMasks.rough, 0, 0);
        ctx.restore();
        this.roughCoverage.fill(1);
      } else if (tool === "fine") {
        const ctx = this.fineCtx;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = .76;
        ctx.clearRect(0, 0, MATERIAL_WIDTH, MATERIAL_HEIGHT);
        ctx.drawImage(this.depthReliefCanvas, 0, 0);
        ctx.globalCompositeOperation = "screen";
        ctx.globalAlpha = .34;
        ctx.drawImage(this.depthReliefCanvas, -2.4, -2.8);
        ctx.restore();
        this.fineCoverage.fill(1);
        this.fineLoad.clear();
        this.cracks = [];
      } else if (tool === "edge") {
        this.edgeCoverage.fill(1);
      } else if (tool === "polish") {
        this.polishCoverage.fill(1);
      } else if (tool === "brush") {
        this.cleanCoverage.fill(1);
        this.dust = [];
      }

      this.surfaceDirty = true;
    }

    rebuildSurface(force) {
      if (!force && !this.surfaceDirty) {
        return;
      }

      const ctx = this.surfaceCtx;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, MATERIAL_WIDTH, MATERIAL_HEIGHT);
      ctx.drawImage(this.roughTexture, 0, 0);

      const smoothing = this.getProgress("sand");
      if (smoothing > 0) {
        ctx.save();
        ctx.globalAlpha = .25 + smoothing * .75;
        ctx.globalCompositeOperation = "soft-light";
        ctx.drawImage(this.smoothTexture, 0, 0);
        ctx.restore();
      }

      ctx.save();
      ctx.globalCompositeOperation = "soft-light";
      ctx.globalAlpha = this.step >= 4 ? .42 : .18;
      ctx.drawImage(this.depthReliefCanvas, 0, 0);
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = .78;
      ctx.drawImage(this.roughCanvas, 0, 0);
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = .24;
      ctx.drawImage(this.allowedMasks.fine, 0, 0);
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = "soft-light";
      ctx.globalAlpha = .48;
      ctx.drawImage(this.fineCanvas, 0, 0);
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = .14 + this.getProgress("polish") * .23;
      ctx.drawImage(this.fineCanvas, 0, 0);
      ctx.restore();

      const polish = this.getProgress("polish");
      if (polish > 0) {
        const sheen = ctx.createLinearGradient(0, 0, MATERIAL_WIDTH, MATERIAL_HEIGHT);
        sheen.addColorStop(0, "rgba(255,255,255," + (.03 + polish * .06) + ")");
        sheen.addColorStop(.42, "rgba(255,255,255," + (.01 + polish * .035) + ")");
        sheen.addColorStop(.58, "rgba(255,255,255,0)");
        sheen.addColorStop(1, "rgba(255,255,255," + (.02 + polish * .05) + ")");
        ctx.fillStyle = sheen;
        ctx.fillRect(0, 0, MATERIAL_WIDTH, MATERIAL_HEIGHT);
      }

      if (this.step >= 2 && this.step <= 6) {
        const lineAlpha = this.step === 6 ? .38 : this.step === 5 ? .34 : .72;
        this.drawLineLayer(ctx, lineAlpha);
      }

      this.drawCracks(ctx);
      this.surfaceDirty = false;
    }

    drawLineLayer(ctx, alpha) {
      const transform = this.lineTransform;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(500 + transform.x, 350 + transform.y);
      ctx.scale(transform.scale, transform.scale);
      ctx.translate(-500, -350);
      ctx.drawImage(this.model.getCanvas("line"), 0, 0);
      ctx.restore();
    }

    drawCracks(ctx) {
      if (!this.cracks.length) {
        return;
      }
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      this.cracks.forEach(function (crack) {
        ctx.strokeStyle = "rgba(35,29,25,.78)";
        ctx.lineWidth = crack.width;
        ctx.beginPath();
        crack.points.forEach(function (point, index) {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
        ctx.strokeStyle = "rgba(225,218,205,.38)";
        ctx.lineWidth = Math.max(.65, crack.width * .45);
        ctx.beginPath();
        crack.points.forEach(function (point, index) {
          if (index === 0) {
            ctx.moveTo(point.x - .8, point.y + .8);
          } else {
            ctx.lineTo(point.x - .8, point.y + .8);
          }
        });
        ctx.stroke();
      });
      ctx.restore();
    }

    addCrack(modelPoint) {
      const baseX = clamp(modelPoint.x, 80, 920);
      const baseY = clamp(modelPoint.y, 70, 630);
      const points = [{ x: baseX, y: baseY }];
      let angle = Math.random() * Math.PI * 2;
      for (let i = 0; i < 12; i += 1) {
        angle += (Math.random() - .5) * .9;
        const step = 5 + Math.random() * 13;
        points.push({
          x: clamp(points[points.length - 1].x + Math.cos(angle) * step, 62, 938),
          y: clamp(points[points.length - 1].y + Math.sin(angle) * step, 48, 652)
        });
      }
      this.cracks.push({
        points: points,
        width: .8 + Math.random() * 1.8,
        createdAt: performance.now()
      });
      this.surfaceDirty = true;
    }

    getProgress(key) {
      if (key === "brush") {
        key = "clean";
      }
      if (key === "rough") {
        return clamp(this.countCoverage(this.roughCoverage) / Math.max(1, this.requiredCells.rough), 0, 1);
      }
      if (key === "fine") {
        return clamp(this.countCoverage(this.fineCoverage) / Math.max(1, this.requiredCells.fine), 0, 1);
      }
      if (key === "edge") {
        return clamp(this.countCoverage(this.edgeCoverage) / Math.max(1, this.requiredCells.edge), 0, 1);
      }
      if (key === "polish") {
        return clamp(this.countCoverage(this.polishCoverage) / Math.max(1, this.requiredCells.polish), 0, 1);
      }
      if (key === "clean") {
        return clamp(this.countCoverage(this.cleanCoverage) / Math.max(1, this.requiredCells.clean), 0, 1);
      }
      if (key === "sand" && this._sandProgress !== undefined) {
        return this._sandProgress;
      }
      return 0;
    }

    setSandProgress(value) {
      this._sandProgress = clamp(value, 0, 1);
      this.surfaceDirty = true;
    }

    countCoverage(array) {
      let count = 0;
      for (let i = 0; i < array.length; i += 1) {
        if (array[i]) {
          count += 1;
        }
      }
      return count;
    }

    markCoverage(array, modelPoint, radius) {
      const cellWidth = MATERIAL_WIDTH / GRID_COLUMNS;
      const cellHeight = MATERIAL_HEIGHT / GRID_ROWS;
      const radiusX = Math.ceil(radius / cellWidth);
      const radiusY = Math.ceil(radius / cellHeight);
      const centerColumn = Math.floor(modelPoint.x / cellWidth);
      const centerRow = Math.floor(modelPoint.y / cellHeight);
      let added = 0;

      for (let row = centerRow - radiusY; row <= centerRow + radiusY; row += 1) {
        for (let column = centerColumn - radiusX; column <= centerColumn + radiusX; column += 1) {
          if (row < 0 || row >= GRID_ROWS || column < 0 || column >= GRID_COLUMNS) {
            continue;
          }
          const dx = (column - centerColumn) * cellWidth;
          const dy = (row - centerRow) * cellHeight;
          if (Math.hypot(dx, dy) > radius) {
            continue;
          }
          const index = row * GRID_COLUMNS + column;
          if (!array[index]) {
            array[index] = 1;
            added += 1;
          }
        }
      }
      return added;
    }

    stampRadial(ctx, point, radius, colors) {
      const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
      colors.forEach(function (color) {
        gradient.addColorStop(color[0], color[1]);
      });
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    applyRough(modelPoint, pressure) {
      const area = this.model.sampleMask(modelPoint.x, modelPoint.y);
      if (area.type !== "background") {
        return {
          ok: false,
          type: "wrong-area",
          area: area,
          message: "粗刻刀只能去背景地子，当前触碰到“" + area.label + "”，已自动收刀。"
        };
      }

      const radius = 58 + pressure * 10;
      this.roughCtx.save();
      this.roughCtx.globalCompositeOperation = "source-over";
      this.stampRadial(this.roughCtx, modelPoint, radius, [
        [0, "rgba(30,27,23,.44)"],
        [.56, "rgba(41,37,31,.28)"],
        [1, "rgba(50,45,38,0)"]
      ]);
      this.roughCtx.restore();

      const added = this.markCoverage(this.roughCoverage, modelPoint, radius * .76);
      this.addDustPoint(modelPoint, "rough", 3 + Math.round(added * .13));
      this.surfaceDirty = true;
      return {
        ok: true,
        type: "carve",
        added: added,
        progress: this.getProgress("rough")
      };
    }

    applyFine(modelPoint, pressure) {
      const area = this.model.sampleMask(modelPoint.x, modelPoint.y);
      if (area.type !== "subject") {
        return {
          ok: false,
          type: "wrong-area",
          area: area,
          message: "细刻刀只作用于花瓣、鸟羽、宝瓶与卷草等主体纹样，当前区域不下刀。"
        };
      }

      const targetDepth = this.model.sampleDepth(modelPoint.x, modelPoint.y);
      const key = Math.round(modelPoint.x / 18) + ":" + Math.round(modelPoint.y / 18);
      const previousLoad = this.fineLoad.get(key) || 0;
      const tolerance = this.brickId === "premium" ? 22 : 13;
      const nextLoad = previousLoad + .55 + pressure * .65;
      this.fineLoad.set(key, nextLoad);

      if (nextLoad > tolerance) {
        const existingCrack = this.cracks.some(function (crack) {
          return crack.key === key;
        });
        if (!existingCrack) {
          this.addCrack(modelPoint);
          this.cracks[this.cracks.length - 1].key = key;
        }
        return {
          ok: false,
          type: "overcarve",
          area: area,
          depth: targetDepth,
          message: this.brickId === "premium"
            ? "同一纹样区域已超过工艺深度上限，青砖出现崩裂。请避开裂纹，改用修边刀整理。"
            : "微瑕疵砖的局部承力较弱，过度深挖导致明显崩边。后续需降低走刀密度。"
        };
      }

      const radius = 25 + pressure * 7;
      const brightness = .18 + targetDepth * .34;
      this.fineCtx.save();
      this.fineCtx.globalCompositeOperation = "source-over";
      this.stampRadial(this.fineCtx, modelPoint, radius + 2, [
        [0, "rgba(236,229,214," + brightness + ")"],
        [.58, "rgba(216,207,190," + brightness * .48 + ")"],
        [1, "rgba(160,150,133,0)"]
      ]);
      this.fineCtx.globalCompositeOperation = "multiply";
      this.stampRadial(this.fineCtx, { x: modelPoint.x + 2.4, y: modelPoint.y + 3.2 }, radius, [
        [0, "rgba(37,32,27,.2)"],
        [.7, "rgba(45,39,32,.08)"],
        [1, "rgba(55,48,40,0)"]
      ]);
      this.fineCtx.restore();

      const added = this.markCoverage(this.fineCoverage, modelPoint, radius * .68);
      this.addDustPoint(modelPoint, "fine", 2 + Math.round(added * .11));
      this.surfaceDirty = true;
      return {
        ok: true,
        type: "carve",
        added: added,
        depth: targetDepth,
        progress: this.getProgress("fine")
      };
    }

    isOutlinePoint(modelPoint) {
      const center = this.model.sampleMask(modelPoint.x, modelPoint.y);
      if (center.type === "background") {
        return false;
      }
      const offsets = [[6, 0], [-6, 0], [0, 6], [0, -6], [5, 5], [-5, -5]];
      return offsets.some((offset) => {
        const neighbor = this.model.sampleMask(modelPoint.x + offset[0], modelPoint.y + offset[1]);
        return neighbor.type !== center.type;
      });
    }

    applyEdge(modelPoint, pressure) {
      const area = this.model.sampleMask(modelPoint.x, modelPoint.y);
      if (area.type === "background" || !this.isOutlinePoint(modelPoint)) {
        return {
          ok: false,
          type: "off-edge",
          message: "修边刀应沿纹样轮廓与外框走刀。请靠近主体或回纹边界，再缓慢拖动。"
        };
      }

      const radius = 15 + pressure * 5;
      this.fineCtx.save();
      this.fineCtx.globalCompositeOperation = "screen";
      this.stampRadial(this.fineCtx, modelPoint, radius, [
        [0, "rgba(237,231,217,.3)"],
        [.76, "rgba(227,218,201,.12)"],
        [1, "rgba(255,255,255,0)"]
      ]);
      this.fineCtx.restore();
      const added = this.markCoverage(this.edgeCoverage, modelPoint, radius);
      this.surfaceDirty = true;
      return {
        ok: true,
        type: "finish",
        added: added,
        progress: this.getProgress("edge")
      };
    }

    applyPolish(modelPoint, pressure) {
      const radius = 48 + pressure * 15;
      this.fineCtx.save();
      this.fineCtx.globalCompositeOperation = "screen";
      this.stampRadial(this.fineCtx, modelPoint, radius, [
        [0, "rgba(241,236,224,.1)"],
        [.7, "rgba(228,220,205,.04)"],
        [1, "rgba(255,255,255,0)"]
      ]);
      this.fineCtx.restore();
      const added = this.markCoverage(this.polishCoverage, modelPoint, radius * .82);
      this.surfaceDirty = true;
      return {
        ok: true,
        type: "finish",
        added: added,
        progress: this.getProgress("polish")
      };
    }

    applyClean(modelPoint) {
      const area = this.model.sampleMask(modelPoint.x, modelPoint.y);
      if (area.type === "background") {
        return {
          ok: false,
          type: "cleaning-empty",
          message: "毛刷主要用于清除纹样转折处与雕槽内的砖灰。请将毛刷移到主体或边框上。"
        };
      }
      this.dust = this.dust.filter(function (particle) {
        return distance(particle, modelPoint) > 62;
      });
      const added = this.markCoverage(this.cleanCoverage, modelPoint, 25);
      return {
        ok: true,
        type: "finish",
        added: added,
        progress: this.getProgress("clean")
      };
    }

    addDustPoint(modelPoint, kind, count) {
      const now = performance.now();
      if (now - this.lastDustTime < 55 && this.dust.length > 70) {
        return;
      }
      this.lastDustTime = now;
      for (let i = 0; i < count; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 10 + Math.random() * 27;
        this.dust.push({
          x: modelPoint.x,
          y: modelPoint.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 15,
          gravity: 22 + Math.random() * 24,
          radius: kind === "rough" ? 1.2 + Math.random() * 2.7 : .7 + Math.random() * 1.8,
          alpha: .28 + Math.random() * .38,
          life: .65 + Math.random() * .7,
          age: 0
        });
      }
      if (this.dust.length > 180) {
        this.dust.splice(0, this.dust.length - 180);
      }
    }

    updateDust(deltaSeconds) {
      if (!this.dust.length) {
        return;
      }
      this.dust = this.dust.filter(function (particle) {
        particle.age += deltaSeconds;
        particle.x += particle.vx * deltaSeconds;
        particle.y += particle.vy * deltaSeconds;
        particle.vy += particle.gravity * deltaSeconds;
        particle.vx *= .985;
        particle.alpha *= .987;
        return particle.age < particle.life;
      });
    }

    applyTool(tool, screenPoint, pressure) {
      if (!this.pointInsideFace(screenPoint)) {
        return { ok: false, type: "outside", message: "当前指针不在砖面范围内。" };
      }
      const modelPoint = this.screenToModel(screenPoint);
      const normalizedPressure = clamp(pressure || .4, .08, 1);
      let result;

      if (tool === "rough") {
        result = this.applyRough(modelPoint, normalizedPressure);
      } else if (tool === "fine") {
        result = this.applyFine(modelPoint, normalizedPressure);
      } else if (tool === "edge") {
        result = this.applyEdge(modelPoint, normalizedPressure);
      } else if (tool === "polish") {
        result = this.applyPolish(modelPoint, normalizedPressure);
      } else if (tool === "brush") {
        result = this.applyClean(modelPoint);
      } else {
        result = { ok: false, type: "none", message: "当前未选择可用的工匠工具。" };
      }

      result.point = modelPoint;
      this.lastPointer = modelPoint;
      return result;
    }

    update(deltaSeconds) {
      const ease = 1 - Math.pow(.001, deltaSeconds);
      this.orientation.yaw = lerp(this.orientation.yaw, this.orientationTarget.yaw, ease);
      this.orientation.pitch = lerp(this.orientation.pitch, this.orientationTarget.pitch, ease);
      this.updateDust(deltaSeconds);

      this.surfaceClock += deltaSeconds * 1000;
      if (this.surfaceDirty && this.surfaceClock > 52) {
        this.surfaceClock = 0;
        this.rebuildSurface(false);
      }
    }

    drawBackdrop(ctx) {
      ctx.clearRect(0, 0, this.width, this.height);
      const gradient = ctx.createRadialGradient(
        this.width * .5,
        this.height * .45,
        10,
        this.width * .5,
        this.height * .48,
        Math.max(this.width, this.height) * .75
      );
      gradient.addColorStop(0, "rgba(255,255,255,0)");
      gradient.addColorStop(1, "rgba(43,40,35,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    drawBrickBody(geometry) {
      const ctx = this.ctx;
      const points = geometry.points;
      const centroid = this.polygonCentroid(points);
      const sideOffset = geometry.sideDepth * geometry.depthDirection;

      ctx.save();
      ctx.translate(0, 20);
      ctx.filter = "blur(15px)";
      ctx.fillStyle = "rgba(26,24,21,.28)";
      ctx.beginPath();
      ctx.ellipse(
        geometry.centerX + 10,
        geometry.bottom - 2,
        geometry.faceWidth * .52,
        Math.max(14, geometry.faceHeight * .1),
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();

      const sidePoints = geometry.depthDirection > 0
        ? [points[1], points[2], { x: points[2].x + sideOffset, y: points[2].y + 6 }, { x: points[1].x + sideOffset, y: points[1].y + 6 }]
        : [points[0], points[3], { x: points[3].x + sideOffset, y: points[3].y + 6 }, { x: points[0].x + sideOffset, y: points[0].y + 6 }];

      ctx.save();
      ctx.shadowColor = "rgba(27,25,22,.22)";
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 9;
      quadPath(ctx, sidePoints);
      const sideGradient = ctx.createLinearGradient(
        Math.min(sidePoints[0].x, sidePoints[2].x),
        Math.min(sidePoints[0].y, sidePoints[2].y),
        Math.max(sidePoints[1].x, sidePoints[3].x),
        Math.max(sidePoints[1].y, sidePoints[3].y)
      );
      sideGradient.addColorStop(0, "#6e685d");
      sideGradient.addColorStop(1, "#403d37");
      ctx.fillStyle = sideGradient;
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.shadowColor = "rgba(29,27,24,.2)";
      ctx.shadowBlur = 11;
      ctx.shadowOffsetY = 6;
      quadPath(ctx, points);
      ctx.fillStyle = "#6e6a61";
      ctx.fill();
      ctx.restore();

      ctx.save();
      quadPath(ctx, points);
      ctx.clip();

      if (geometry.frontVisible) {
        const sourceWidth = MATERIAL_WIDTH;
        const sourceHeight = MATERIAL_HEIGHT;
        const sourceX = 0;
        const sourceY = 0;
        ctx.drawImage(
          this.surfaceCanvas,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          geometry.left,
          geometry.top,
          geometry.faceWidth,
          geometry.faceHeight
        );
      } else {
        ctx.drawImage(
          this.roughTexture,
          geometry.left,
          geometry.top,
          geometry.faceWidth,
          geometry.faceHeight
        );
        ctx.fillStyle = "rgba(42,40,36,.14)";
        ctx.fillRect(geometry.left, geometry.top, geometry.faceWidth, geometry.faceHeight);
      }

      const light = ctx.createLinearGradient(
        geometry.left,
        geometry.top,
        geometry.right,
        geometry.bottom
      );
      light.addColorStop(0, "rgba(255,255,255,.23)");
      light.addColorStop(.34, "rgba(255,255,255,.035)");
      light.addColorStop(.72, "rgba(0,0,0,.035)");
      light.addColorStop(1, "rgba(0,0,0,.14)");
      ctx.fillStyle = light;
      ctx.fillRect(geometry.left, geometry.top, geometry.faceWidth, geometry.faceHeight);

      const centerGlow = ctx.createRadialGradient(
        geometry.centerX - geometry.faceWidth * .18,
        geometry.centerY - geometry.faceHeight * .2,
        4,
        geometry.centerX,
        geometry.centerY,
        geometry.faceWidth * .78
      );
      centerGlow.addColorStop(0, "rgba(255,255,255,.095)");
      centerGlow.addColorStop(.52, "rgba(255,255,255,.01)");
      centerGlow.addColorStop(1, "rgba(17,15,13,.11)");
      ctx.fillStyle = centerGlow;
      ctx.fillRect(geometry.left, geometry.top, geometry.faceWidth, geometry.faceHeight);
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = "rgba(31,29,26,.34)";
      ctx.lineWidth = 1;
      quadPath(ctx, points);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = "rgba(231,225,211,.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(points[0].x + 1.5, points[0].y + 1.5);
      ctx.lineTo(points[1].x - 1.5, points[1].y + 1.5);
      ctx.stroke();
      ctx.restore();

      this.drawDustParticles(geometry);
    }

    drawDustParticles(geometry) {
      if (!this.dust.length) {
        return;
      }
      const ctx = this.ctx;
      ctx.save();
      quadPath(ctx, geometry.points);
      ctx.clip();
      this.dust.forEach((particle) => {
        const x = geometry.left + particle.x / MATERIAL_WIDTH * geometry.faceWidth;
        const y = geometry.top + particle.y / MATERIAL_HEIGHT * geometry.faceHeight;
        ctx.globalAlpha = Math.max(0, particle.alpha * (1 - particle.age / particle.life));
        ctx.fillStyle = "#d8d0c0";
        ctx.beginPath();
        ctx.arc(x, y, particle.radius * geometry.absCos, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    drawCompletionGlow(geometry) {
      if (this.step < 6) {
        return;
      }
      const ctx = this.ctx;
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const glow = ctx.createRadialGradient(
        geometry.centerX,
        geometry.centerY,
        geometry.faceWidth * .18,
        geometry.centerX,
        geometry.centerY,
        geometry.faceWidth * .62
      );
      glow.addColorStop(0, "rgba(255,252,243,.09)");
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(geometry.left, geometry.top, geometry.faceWidth, geometry.faceHeight);
      ctx.restore();
    }

    render() {
      this.drawBackdrop(this.ctx);
      const geometry = this.getGeometry();
      this.drawBrickBody(geometry);
      this.drawCompletionGlow(geometry);
    }

    drawReference(canvas) {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(320, rect.width * dpr);
      canvas.height = Math.max(420, rect.height * dpr);
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#efebe2");
      gradient.addColorStop(1, "#c9c3b8");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const scale = Math.min(width * .84 / MATERIAL_WIDTH, height * .84 / MATERIAL_HEIGHT);
      const drawWidth = MATERIAL_WIDTH * scale;
      const drawHeight = MATERIAL_HEIGHT * scale;
      const x = (width - drawWidth) / 2;
      const y = (height - drawHeight) / 2;
      ctx.save();
      ctx.shadowColor = "rgba(34,31,27,.24)";
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 15;
      ctx.fillStyle = "#777268";
      ctx.fillRect(x, y, drawWidth, drawHeight);
      ctx.restore();
      ctx.drawImage(this.model.getCanvas("line"), x, y, drawWidth, drawHeight);
    }

    exportComposite(scene) {
      const width = 1600;
      const height = 1000;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      if (scene === "courtyard") {
        const wall = ctx.createLinearGradient(0, 0, 0, height);
        wall.addColorStop(0, "#747169");
        wall.addColorStop(.2, "#928b80");
        wall.addColorStop(.7, "#817a6f");
        wall.addColorStop(1, "#4e4a43");
        ctx.fillStyle = wall;
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "rgba(61,57,51,.42)";
        for (let y = 210; y < 790; y += 42) {
          ctx.fillRect(0, y, width, 2);
        }
        for (let x = 76; x < width; x += 106) {
          ctx.fillRect(x % 212 === 76 ? x : x + 53, 210, 2, 580);
        }
        ctx.fillStyle = "rgba(35,33,29,.35)";
        ctx.fillRect(0, 820, width, 180);
      } else {
        const white = ctx.createRadialGradient(800, 430, 60, 800, 500, 900);
        white.addColorStop(0, "#ffffff");
        white.addColorStop(.62, "#f0ede6");
        white.addColorStop(1, "#d4cfc5");
        ctx.fillStyle = white;
        ctx.fillRect(0, 0, width, height);
      }

      const drawWidth = scene === "courtyard" ? 1000 : 1080;
      const drawHeight = drawWidth * .7;
      const x = (width - drawWidth) / 2;
      const y = (height - drawHeight) / 2 - 18;
      ctx.save();
      ctx.shadowColor = "rgba(27,25,22,.34)";
      ctx.shadowBlur = 34;
      ctx.shadowOffsetY = 25;
      ctx.fillStyle = "#5e5a52";
      ctx.fillRect(x + 18, y + 13, drawWidth, drawHeight);
      ctx.drawImage(this.surfaceCanvas, x, y, drawWidth, drawHeight);
      ctx.restore();

      ctx.fillStyle = "rgba(247,244,237,.92)";
      ctx.fillRect(54, 54, 260, 58);
      ctx.fillStyle = "#302f2b";
      ctx.font = "700 26px 'Songti SC', serif";
      ctx.fillText("津派博古花鸟砖雕", 74, 92);
      ctx.font = "13px 'Microsoft YaHei', sans-serif";
      ctx.fillStyle = "rgba(48,47,43,.7)";
      ctx.fillText("天津非遗数字工艺档案", 74, 139);
      return canvas;
    }
  }

  window.BrickStudioRenderer = BrickRenderer;
}());
