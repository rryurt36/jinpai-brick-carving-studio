(function () {
  "use strict";

  const TAU = Math.PI * 2;

  function clearCanvas(canvas) {
    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return ctx;
  }

  function roundedRectPath(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function petalPath(ctx, cx, cy, rx, ry, rotation) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.moveTo(0, -ry);
    ctx.bezierCurveTo(rx * .96, -ry * .78, rx * .86, ry * .62, 0, ry);
    ctx.bezierCurveTo(-rx * .86, ry * .62, -rx * .96, -ry * .78, 0, -ry);
    ctx.closePath();
    ctx.restore();
  }

  function leafPath(ctx, cx, cy, length, width, rotation) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.moveTo(-length / 2, 0);
    ctx.bezierCurveTo(-length * .2, -width, length * .28, -width, length / 2, 0);
    ctx.bezierCurveTo(length * .24, width, -length * .24, width, -length / 2, 0);
    ctx.closePath();
    ctx.restore();
  }

  function cloudPath(ctx, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.moveTo(-48, 12);
    ctx.bezierCurveTo(-56, -6, -42, -22, -24, -17);
    ctx.bezierCurveTo(-18, -39, 10, -45, 24, -25);
    ctx.bezierCurveTo(45, -30, 59, -12, 48, 6);
    ctx.bezierCurveTo(66, 10, 66, 30, 47, 33);
    ctx.lineTo(-42, 33);
    ctx.bezierCurveTo(-63, 31, -66, 15, -48, 12);
    ctx.closePath();
    ctx.restore();
  }

  function vasePath(ctx, cx, cy, scale) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.moveTo(-13, -86);
    ctx.lineTo(13, -86);
    ctx.bezierCurveTo(14, -70, 22, -68, 29, -61);
    ctx.bezierCurveTo(37, -50, 44, -22, 40, 17);
    ctx.bezierCurveTo(37, 48, 24, 65, 12, 70);
    ctx.bezierCurveTo(5, 76, -5, 76, -12, 70);
    ctx.bezierCurveTo(-24, 65, -37, 48, -40, 17);
    ctx.bezierCurveTo(-44, -22, -37, -50, -29, -61);
    ctx.bezierCurveTo(-22, -68, -14, -70, -13, -86);
    ctx.closePath();
    ctx.restore();
  }

  function scrollPath(ctx, cx, cy) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    ctx.moveTo(-78, -28);
    ctx.bezierCurveTo(-23, -47, 37, -37, 54, -15);
    ctx.lineTo(54, 20);
    ctx.bezierCurveTo(33, 2, -23, -5, -78, 15);
    ctx.closePath();
    ctx.restore();
  }

  function bookPath(ctx, x, y, width, height) {
    ctx.beginPath();
    ctx.moveTo(x, y + 7);
    ctx.quadraticCurveTo(x + width * .52, y - 4, x + width, y + 5);
    ctx.lineTo(x + width, y + height);
    ctx.quadraticCurveTo(x + width * .52, y + height - 7, x, y + height + 4);
    ctx.lineTo(x, y + 7);
    ctx.closePath();
  }

  function birdBodyPath(ctx) {
    ctx.beginPath();
    ctx.moveTo(652, 239);
    ctx.bezierCurveTo(620, 231, 594, 205, 601, 178);
    ctx.bezierCurveTo(607, 150, 639, 135, 670, 150);
    ctx.bezierCurveTo(701, 163, 715, 190, 704, 220);
    ctx.bezierCurveTo(696, 243, 678, 268, 647, 281);
    ctx.bezierCurveTo(630, 289, 622, 313, 600, 316);
    ctx.bezierCurveTo(613, 287, 632, 269, 652, 239);
    ctx.closePath();
  }

  function birdWingPath(ctx) {
    ctx.beginPath();
    ctx.moveTo(652, 190);
    ctx.bezierCurveTo(686, 162, 731, 166, 754, 193);
    ctx.bezierCurveTo(726, 188, 710, 203, 697, 225);
    ctx.bezierCurveTo(679, 205, 662, 202, 640, 215);
    ctx.closePath();
  }

  function birdTailPath(ctx, offset, angle) {
    ctx.save();
    ctx.translate(641 + offset, 268 + offset * .18);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.bezierCurveTo(-45, -12, -76, -2, -107, 25);
    ctx.bezierCurveTo(-71, 23, -43, 29, -19, 48);
    ctx.bezierCurveTo(-16, 22, -7, 4, 0, -8);
    ctx.closePath();
    ctx.restore();
  }

  function grassPath(ctx, cx, cy, length, curl) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.bezierCurveTo(
      cx - length * .18,
      cy - length * .3,
      cx + length * .18,
      cy - length * .62,
      cx + curl,
      cy - length
    );
    ctx.bezierCurveTo(
      cx + length * .05,
      cy - length * .58,
      cx + length * .32,
      cy - length * .3,
      cx + length * .3,
      cy
    );
    ctx.closePath();
  }

  function meanderUnit(ctx, x, y, unit, horizontal) {
    const inner = unit * .46;
    ctx.save();
    ctx.translate(x, y);
    if (!horizontal) {
      ctx.rotate(Math.PI / 2);
    }
    ctx.beginPath();
    ctx.moveTo(0, -unit * .42);
    ctx.lineTo(0, unit * .08);
    ctx.lineTo(inner, unit * .08);
    ctx.lineTo(inner, -unit * .2);
    ctx.lineTo(unit * .2, -unit * .2);
    ctx.lineTo(unit * .2, 0);
    ctx.lineTo(unit * .72, 0);
    ctx.lineTo(unit * .72, -unit * .42);
    ctx.stroke();
    ctx.restore();
  }

  function shapeFill(ctx, shape, mode) {
    ctx.beginPath();
    shape.path(ctx);
    ctx.closePath();

    if (mode === "mask") {
      ctx.fillStyle = "rgb(" + shape.mask + "," + shape.mask + "," + shape.mask + ")";
      ctx.fill();
      return;
    }

    if (mode === "depth") {
      const center = shape.depthCenter || shape.center || [500, 350];
      const spread = shape.depthSpread || 190;
      const gradient = ctx.createRadialGradient(
        center[0],
        center[1],
        8,
        center[0],
        center[1],
        spread
      );
      gradient.addColorStop(0, "rgb(" + shape.depthHigh + "," + shape.depthHigh + "," + shape.depthHigh + ")");
      gradient.addColorStop(1, "rgb(" + shape.depth + "," + shape.depth + "," + shape.depth + ")");
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }

  function createShapeSet() {
    const shapes = [];

    function add(path, options) {
      shapes.push(Object.assign({
        path: path,
        mask: 248,
        depth: 150,
        depthHigh: 218,
        lineWidth: 2
      }, options || {}));
    }

    add(function (ctx) {
      ctx.beginPath();
      roundedRectPath(ctx, 330, 420, 340, 142, 26);
    }, { mask: 246, depth: 96, depthHigh: 126, center: [500, 490], depthSpread: 180 });

    add(function (ctx) {
      scrollPath(ctx, 698, 400);
    }, { mask: 248, depth: 125, depthHigh: 198, center: [690, 398], depthSpread: 150 });

    add(function (ctx) {
      vasePath(ctx, 286, 365, 1.05);
    }, { mask: 250, depth: 164, depthHigh: 226, center: [286, 350], depthSpread: 120 });

    add(function (ctx) {
      vasePath(ctx, 717, 366, .82);
    }, { mask: 250, depth: 144, depthHigh: 210, center: [717, 348], depthSpread: 106 });

    add(function (ctx) {
      bookPath(ctx, 674, 448, 92, 42);
    }, { mask: 248, depth: 114, depthHigh: 180, center: [720, 466], depthSpread: 100 });

    add(function (ctx) {
      bookPath(ctx, 660, 483, 112, 39);
    }, { mask: 248, depth: 106, depthHigh: 174, center: [716, 500], depthSpread: 100 });

    add(function (ctx) {
      ctx.beginPath();
      ctx.moveTo(500, 431);
      ctx.bezierCurveTo(507, 396, 498, 353, 480, 318);
      ctx.bezierCurveTo(493, 331, 510, 347, 520, 365);
      ctx.bezierCurveTo(515, 386, 512, 410, 514, 432);
      ctx.closePath();
    }, { mask: 242, depth: 126, depthHigh: 184, center: [500, 390], depthSpread: 100 });

    add(function (ctx) {
      ctx.beginPath();
      ctx.moveTo(529, 431);
      ctx.bezierCurveTo(541, 397, 556, 371, 577, 350);
      ctx.bezierCurveTo(562, 381, 560, 407, 566, 431);
      ctx.closePath();
    }, { mask: 242, depth: 130, depthHigh: 188, center: [556, 389], depthSpread: 90 });

    add(function (ctx) {
      birdBodyPath(ctx);
    }, { mask: 252, depth: 142, depthHigh: 226, center: [664, 207], depthSpread: 130 });

    add(function (ctx) {
      birdWingPath(ctx);
    }, { mask: 252, depth: 174, depthHigh: 244, center: [687, 192], depthSpread: 112 });

    add(function (ctx) {
      birdTailPath(ctx, 0, -.16);
    }, { mask: 248, depth: 136, depthHigh: 214, center: [594, 275], depthSpread: 130 });

    add(function (ctx) {
      birdTailPath(ctx, -5, .3);
    }, { mask: 248, depth: 126, depthHigh: 206, center: [589, 281], depthSpread: 130 });

    add(function (ctx) {
      birdTailPath(ctx, -10, .72);
    }, { mask: 248, depth: 116, depthHigh: 196, center: [580, 286], depthSpread: 130 });

    const outerPetalAngles = [-2.9, -2.35, -1.78, -1.2, -.62, -.05, .56, 1.15, 1.75, 2.35, 2.94, 3.5];
    outerPetalAngles.forEach(function (angle, index) {
      add(function (ctx) {
        petalPath(ctx, 497 + Math.cos(angle) * 47, 304 + Math.sin(angle) * 39, 45, 83, angle + Math.PI / 2);
      }, {
        mask: 250,
        depth: 108 + (index % 3) * 12,
        depthHigh: 196 + (index % 4) * 8,
        depthCenter: [497, 304],
        depthSpread: 150,
        hideLine: true
      });
    });

    const middlePetalAngles = [-2.72, -2.05, -1.35, -.68, 0, .7, 1.43, 2.12, 2.82, 3.5];
    middlePetalAngles.forEach(function (angle, index) {
      add(function (ctx) {
        petalPath(ctx, 499 + Math.cos(angle) * 25, 306 + Math.sin(angle) * 21, 34, 65, angle + Math.PI / 2);
      }, {
        mask: 252,
        depth: 166 + (index % 3) * 14,
        depthHigh: 232,
        depthCenter: [499, 306],
        depthSpread: 105,
        hideLine: true
      });
    });

    const innerPetalAngles = [-2.5, -1.7, -.88, -.05, .75, 1.55, 2.35, 3.12];
    innerPetalAngles.forEach(function (angle, index) {
      add(function (ctx) {
        petalPath(ctx, 500 + Math.cos(angle) * 13, 307 + Math.sin(angle) * 10, 27, 48, angle + Math.PI / 2);
      }, {
        mask: 254,
        depth: 204 + (index % 2) * 18,
        depthHigh: 252,
        depthCenter: [500, 307],
        depthSpread: 80,
        hideLine: true
      });
    });

    add(function (ctx) {
      ctx.beginPath();
      ctx.arc(500, 307, 35, 0, TAU);
    }, { mask: 255, depth: 230, depthHigh: 255, center: [500, 307], depthSpread: 60, hideLine: true });

    [
      [438, 391, 98, 32, -.65],
      [555, 407, 105, 36, .43],
      [383, 445, 86, 27, -.18],
      [610, 441, 91, 29, .72],
      [322, 489, 84, 26, -.65],
      [699, 536, 88, 28, -.15]
    ].forEach(function (leaf) {
      add(function (ctx) {
        leafPath(ctx, leaf[0], leaf[1], leaf[2], leaf[3], leaf[4]);
      }, {
        mask: 244,
        depth: 112,
        depthHigh: 174,
        center: [leaf[0], leaf[1]],
        depthSpread: 100
      });
    });

    [
      [394, 548, 104, 20],
      [453, 554, 115, -28],
      [520, 554, 108, 24],
      [580, 552, 116, -18],
      [642, 548, 102, 20]
    ].forEach(function (grass) {
      add(function (ctx) {
        grassPath(ctx, grass[0], grass[1], grass[2], grass[3]);
      }, {
        mask: 240,
        depth: 102,
        depthHigh: 164,
        center: [grass[0], grass[1]],
        depthSpread: 100
      });
    });

    [
      [364, 200, .8],
      [762, 556, .63]
    ].forEach(function (cloud) {
      add(function (ctx) {
        cloudPath(ctx, cloud[0], cloud[1], cloud[2]);
      }, {
        mask: 235,
        depth: 84,
        depthHigh: 138,
        center: [cloud[0], cloud[1]],
        depthSpread: 100
      });
    });

    return shapes;
  }

  function paintMeanderBand(ctx, mode) {
    const outer = { x: 72, y: 42, w: 856, h: 616 };
    const inner = { x: 130, y: 100, w: 740, h: 500 };

    ctx.save();
    ctx.beginPath();
    ctx.rect(outer.x, outer.y, outer.w, outer.h);
    ctx.rect(inner.x, inner.y, inner.w, inner.h);
    if (mode === "mask") {
      ctx.fillStyle = "rgb(186,186,186)";
      ctx.fill("evenodd");
    } else if (mode === "depth") {
      const gradient = ctx.createLinearGradient(outer.x, outer.y, outer.x + outer.w, outer.y + outer.h);
      gradient.addColorStop(0, "rgb(112,112,112)");
      gradient.addColorStop(.5, "rgb(156,156,156)");
      gradient.addColorStop(1, "rgb(104,104,104)");
      ctx.fillStyle = gradient;
      ctx.fill("evenodd");
    } else {
      ctx.strokeStyle = "rgba(35,33,29,.92)";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.strokeStyle = "rgba(35,33,29,.52)";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(91, 60, 818, 580);
      ctx.strokeRect(115, 85, 770, 530);
    }
    ctx.restore();

    if (mode !== "line") {
      return;
    }

    const unit = 40;
    ctx.save();
    ctx.strokeStyle = "rgba(35,33,29,.84)";
    ctx.lineWidth = 2.2;
    for (let x = 135, index = 0; x < 850; x += unit, index += 1) {
      meanderUnit(ctx, x, 69, unit, true);
      meanderUnit(ctx, x + 20, 628, unit, false);
    }
    for (let y = 117, index = 0; y < 585; y += unit, index += 1) {
      meanderUnit(ctx, 101, y, unit, false);
      meanderUnit(ctx, 898, y + 20, unit, true);
    }
    ctx.restore();

    [
      [130, 100, 1, 1],
      [870, 100, -1, 1],
      [130, 600, 1, -1],
      [870, 600, -1, -1]
    ].forEach(function (corner) {
      ctx.save();
      ctx.translate(corner[0], corner[1]);
      ctx.scale(corner[2], corner[3]);
      ctx.beginPath();
      ctx.moveTo(0, 40);
      ctx.bezierCurveTo(4, 10, 10, 4, 40, 0);
      ctx.strokeStyle = "rgba(35,33,29,.82)";
      ctx.lineWidth = 2.4;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(22, 22, 7, 0, TAU);
      ctx.stroke();
      ctx.restore();
    });
  }

  function paintLineArt(ctx, width, height) {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    paintMeanderBand(ctx, "line");

    const shapes = createShapeSet();
    shapes.forEach(function (shape) {
      if (shape.hideLine) {
        return;
      }
      ctx.beginPath();
      shape.path(ctx);
      ctx.closePath();
      ctx.strokeStyle = "rgba(28,27,24,.93)";
      ctx.lineWidth = shape.lineWidth;
      ctx.stroke();
    });

    ctx.strokeStyle = "rgba(28,27,24,.74)";
    ctx.lineWidth = 1.35;

    ctx.beginPath();
    for (let i = 0; i <= 10; i += 1) {
      const angle = -Math.PI / 2 + i / 10 * TAU;
      const radius = i % 2 === 0 ? 68 : 82;
      const x = 500 + Math.cos(angle) * radius;
      const y = 307 + Math.sin(angle) * radius * .82;
      const localAngle = 500 + Math.cos(angle - .24) * (radius + 15);
      const localY = 307 + Math.sin(angle - .24) * (radius + 15) * .82;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.quadraticCurveTo(localAngle, localY, x, y);
      }
    }
    ctx.closePath();
    ctx.lineWidth = 2.25;
    ctx.stroke();

    ctx.beginPath();
    for (let i = 0; i <= 7; i += 1) {
      const angle = -Math.PI / 2 + i / 7 * TAU;
      const radius = i % 2 === 0 ? 27 : 42;
      const x = 500 + Math.cos(angle) * radius;
      const y = 307 + Math.sin(angle) * radius * .8;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.quadraticCurveTo(
          500 + Math.cos(angle - .32) * (radius + 14),
          307 + Math.sin(angle - .32) * (radius + 14) * .8,
          x,
          y
        );
      }
    }
    ctx.closePath();
    ctx.stroke();

    for (let i = 0; i < 10; i += 1) {
      const angle = -Math.PI / 2 + i / 10 * TAU;
      ctx.beginPath();
      ctx.moveTo(500 + Math.cos(angle) * 18, 307 + Math.sin(angle) * 15);
      ctx.quadraticCurveTo(
        500 + Math.cos(angle - .15) * 52,
        307 + Math.sin(angle - .15) * 44,
        500 + Math.cos(angle) * 76,
        307 + Math.sin(angle) * 63
      );
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(500, 307, 17, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(500, 307, 7, 0, TAU);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(270, 290);
    ctx.quadraticCurveTo(286, 323, 269, 350);
    ctx.quadraticCurveTo(306, 367, 304, 410);
    ctx.moveTo(300, 277);
    ctx.quadraticCurveTo(315, 315, 296, 346);
    ctx.moveTo(275, 475);
    ctx.quadraticCurveTo(286, 451, 302, 477);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(252, 312);
    ctx.quadraticCurveTo(269, 352, 254, 393);
    ctx.moveTo(320, 310);
    ctx.quadraticCurveTo(303, 354, 319, 397);
    ctx.moveTo(266, 333);
    ctx.quadraticCurveTo(286, 348, 304, 333);
    ctx.moveTo(257, 367);
    ctx.quadraticCurveTo(285, 384, 312, 365);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(700, 519);
    ctx.quadraticCurveTo(719, 497, 739, 518);
    ctx.moveTo(718, 469);
    ctx.lineTo(718, 488);
    ctx.moveTo(778, 457);
    ctx.quadraticCurveTo(757, 477, 786, 488);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(600, 170);
    ctx.quadraticCurveTo(625, 151, 650, 178);
    ctx.quadraticCurveTo(684, 148, 712, 181);
    ctx.moveTo(619, 198);
    ctx.quadraticCurveTo(665, 173, 727, 199);
    ctx.moveTo(616, 219);
    ctx.quadraticCurveTo(666, 196, 733, 222);
    ctx.stroke();

    for (let i = 0; i < 7; i += 1) {
      ctx.beginPath();
      ctx.moveTo(638 - i * 7, 252 + i * 5);
      ctx.quadraticCurveTo(596 - i * 13, 250 + i * 7, 552 - i * 15, 272 + i * 10);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(590, 178);
    ctx.quadraticCurveTo(572, 165, 584, 153);
    ctx.quadraticCurveTo(599, 161, 590, 178);
    ctx.moveTo(646, 147);
    ctx.quadraticCurveTo(650, 133, 662, 136);
    ctx.quadraticCurveTo(666, 148, 654, 154);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(647, 151, 2.2, 0, TAU);
    ctx.fillStyle = "rgba(28,27,24,.9)";
    ctx.fill();

    [
      [409, 470, 38, -.7],
      [541, 483, 46, .35],
      [355, 519, 42, .18],
      [641, 509, 48, -.5]
    ].forEach(function (detail) {
      ctx.beginPath();
      ctx.moveTo(detail[0] - detail[2] / 2, detail[1]);
      ctx.quadraticCurveTo(detail[0], detail[1] - 12, detail[0] + detail[2] / 2, detail[1]);
      ctx.stroke();
    });

    ctx.beginPath();
    ctx.moveTo(345, 503);
    ctx.bezierCurveTo(382, 483, 416, 513, 452, 491);
    ctx.bezierCurveTo(484, 471, 530, 518, 565, 484);
    ctx.bezierCurveTo(597, 452, 629, 517, 682, 484);
    ctx.stroke();

    ctx.save();
    ctx.strokeStyle = "rgba(28,27,24,.56)";
    ctx.lineWidth = 1;
    for (let x = 141; x < 858; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 104);
      ctx.lineTo(x + 11, 115);
      ctx.lineTo(x + 5, 124);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, 596);
      ctx.lineTo(x + 11, 585);
      ctx.lineTo(x + 5, 576);
      ctx.stroke();
    }
    ctx.restore();

    ctx.restore();
  }

  function paintMask(ctx) {
    ctx.fillStyle = "rgb(18,18,18)";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    paintMeanderBand(ctx, "mask");
    createShapeSet().forEach(function (shape) {
      shapeFill(ctx, shape, "mask");
    });
  }

  function paintDepth(ctx) {
    ctx.fillStyle = "rgb(12,12,12)";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    paintMeanderBand(ctx, "depth");
    const shapes = createShapeSet();
    shapes.sort(function (a, b) {
      return a.depth - b.depth;
    });
    shapes.forEach(function (shape) {
      shapeFill(ctx, shape, "depth");
    });

    ctx.save();
    ctx.globalAlpha = .34;
    ctx.strokeStyle = "rgba(255,255,255,.88)";
    ctx.lineWidth = 2.2;
    shapes.forEach(function (shape) {
      ctx.beginPath();
      shape.path(ctx);
      ctx.stroke();
    });
    ctx.restore();
  }

  class PatternModel {
    constructor(width, height) {
      this.width = width || 1000;
      this.height = height || 700;
      this.lineCanvas = document.createElement("canvas");
      this.maskCanvas = document.createElement("canvas");
      this.depthCanvas = document.createElement("canvas");
      this.maskCanvas.getContext("2d", { willReadFrequently: true });
      this.depthCanvas.getContext("2d", { willReadFrequently: true });
      [this.lineCanvas, this.maskCanvas, this.depthCanvas].forEach((canvas) => {
        canvas.width = this.width;
        canvas.height = this.height;
      });
      this.build();
    }

    build() {
      const lineCtx = clearCanvas(this.lineCanvas);
      paintLineArt(lineCtx, this.width, this.height);

      const maskCtx = clearCanvas(this.maskCanvas);
      paintMask(maskCtx);

      const depthCtx = clearCanvas(this.depthCanvas);
      paintDepth(depthCtx);

      this.maskData = maskCtx.getImageData(0, 0, this.width, this.height).data;
      this.depthData = depthCtx.getImageData(0, 0, this.width, this.height).data;
    }

    sampleMask(x, y) {
      const px = Math.max(0, Math.min(this.width - 1, Math.round(x)));
      const py = Math.max(0, Math.min(this.height - 1, Math.round(y)));
      const index = (py * this.width + px) * 4;
      const value = this.maskData[index] || 0;

      if (value > 222) {
        return { type: "subject", value: value, label: "纹样主体" };
      }
      if (value > 145) {
        return { type: "border", value: value, label: "回纹边框" };
      }
      return { type: "background", value: value, label: "背景地子" };
    }

    sampleDepth(x, y) {
      const px = Math.max(0, Math.min(this.width - 1, Math.round(x)));
      const py = Math.max(0, Math.min(this.height - 1, Math.round(y)));
      const index = (py * this.width + px) * 4;
      return (this.depthData[index] || 0) / 255;
    }

    getCanvas(layer) {
      if (layer === "mask") {
        return this.maskCanvas;
      }
      if (layer === "depth") {
        return this.depthCanvas;
      }
      return this.lineCanvas;
    }

    paintMiniature(ctx, width, height, mode) {
      const canvas = this.getCanvas(mode || "line");
      ctx.save();
      ctx.fillStyle = mode === "mask" ? "#252521" : "#e9e4d9";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(canvas, 0, 0, width, height);
      ctx.restore();
    }
  }

  window.BrickPatternLibrary = {
    PatternModel: PatternModel,
    paintLineArt: paintLineArt,
    clearCanvas: clearCanvas
  };
}());
