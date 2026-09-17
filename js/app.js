(function () {
  "use strict";

  const STEPS = [
    {
      id: "material",
      number: "01",
      short: "选料",
      name: "挑选青砖坯",
      kicker: "选料寻坯",
      heading: "择良材，定砖骨",
      description: "天津老城青砖讲究“声清、面平、色匀”。观察砖体后选择合适砖坯，砖质将影响后续崩裂风险。",
      task: "观察砖体并确认所用砖坯",
      knowledge: {
        title: "津派青砖",
        text: "津派砖雕多用细泥青砖。砖泥需经陈化、制坯、阴干与窑烧，成品致密而不脆，适合多层浅浮雕。"
      },
      hintTitle: "先观察砖体",
      hintText: "拖动旋转，点击右侧砖坯完成选择"
    },
    {
      id: "sand",
      number: "02",
      short: "打磨",
      name: "打磨砖面",
      kicker: "修整砖面",
      heading: "去砂整面，待稿下刀",
      description: "粗坯表面存在窑灰与砂粒。用磨石往复推磨，直至砖面平整细腻，避免落样后线条发虚。",
      task: "覆盖砖面并达到平整度 85%",
      knowledge: {
        title: "磨面为何重要",
        text: "砖面平整度决定起稿清晰度。若打磨不足，线条容易断裂，粗雕时刀口也会因砂粒产生偏滑。"
      },
      hintTitle: "按住并拖动磨石",
      hintText: "往复覆盖整个砖面，不可只磨局部"
    },
    {
      id: "trace",
      number: "03",
      short: "落样",
      name: "起稿落样",
      kicker: "依稿定位",
      heading: "铺陈全稿，定其章法",
      description: "载入完整津派博古花鸟线稿。拖动调整位置，滚轮缩放，使回纹外框与砖面边缘保持均匀留边。",
      task: "调整线稿位置并确认落样",
      knowledge: {
        title: "一稿统全局",
        text: "传统砖雕先以墨线或纸样定位。中心牡丹定主次，两侧宝瓶书卷定骨架，底部卷草与外框使构图闭合。"
      },
      hintTitle: "平移与缩放",
      hintText: "拖动线稿调整位置，滚轮缩放，确认后进入粗雕"
    },
    {
      id: "rough",
      number: "04",
      short: "粗雕",
      name: "粗雕去地",
      kicker: "去地留白",
      heading: "大铲去地，纹样初浮",
      description: "使用粗刻刀清除背景地子。刀口只能触碰黑色背景，越过纹样边界会被系统自动拦截。",
      task: "完成背景去地 78%",
      knowledge: {
        title: "去地留白",
        text: "粗雕不是把背景刻平，而是按画面主次逐层降低地子。主体轮廓由此自然显出，形成第一层空间。"
      },
      hintTitle: "沿背景大面积走刀",
      hintText: "粗刻刀只可进入背景，碰触纹样会被自动收刀"
    },
    {
      id: "fine",
      number: "05",
      short: "细雕",
      name: "细雕修纹",
      kicker: "分层塑形",
      heading: "依灰分层，精刻其势",
      description: "细刻刀只作用于纹样主体。系统根据深度图判定花瓣、鸟羽、宝瓶和卷草的目标层次。",
      task: "完成主体细雕 72%",
      knowledge: {
        title: "深浅有据",
        text: "深色区域对应高浮雕，浅色区域对应浅浮雕。花心最高，花瓣向外递减，鸟羽与卷草又以细线加强层次。"
      },
      hintTitle: "沿纹样内部缓慢刻画",
      hintText: "同一区域反复深挖会超过工艺上限，出现崩裂"
    },
    {
      id: "finish",
      number: "06",
      short: "精修",
      name: "修边抛光 + 清灰",
      kicker: "精加工序",
      heading: "修其边，润其质，净其尘",
      description: "依次完成修边、整体抛光与毛刷清灰。三件工具各有不同作用，必须按工序依次完成。",
      task: "完成修边、抛光、清灰三项",
      knowledge: {
        title: "收尾决定质感",
        text: "修边去毛刺，抛光使砖面温润，清灰则让凹槽阴影更清楚。三步完成后，浮雕光感才会完整显露。"
      },
      hintTitle: "注意工具切换",
      hintText: "沿轮廓修边，覆盖砖面抛光，再扫清纹样中的砖灰"
    },
    {
      id: "display",
      number: "07",
      short: "成品",
      name: "成品展示",
      kicker: "数字展陈",
      heading: "完整砖雕，入景成章",
      description: "成品已生成。可自由旋转观察，在白台与老城四合院影壁场景间切换，并保存高清截图。",
      task: "浏览成品与工艺档案",
      knowledge: {
        title: "津派博古花鸟",
        text: "画面以牡丹飞鸟为中心，宝瓶、书卷、卷草与回纹环绕。吉祥寓意与疏密层次共同构成津派砖雕的审美特征。"
      },
      hintTitle: "拖动旋转查看",
      hintText: "可切换影壁场景、保存截图或查看文物同款对照"
    }
  ];

  const TOOL_DEFINITIONS = [
    { id: "rough", name: "粗刻刀", icon: "i-chisel", key: "1" },
    { id: "fine", name: "细刻刀", icon: "i-fine", key: "2" },
    { id: "edge", name: "修边刀", icon: "i-edge", key: "3" },
    { id: "sand", name: "磨石", icon: "i-sand", key: "4" },
    { id: "polish", name: "磨石", icon: "i-sand", key: "4" },
    { id: "brush", name: "毛刷", icon: "i-brush", key: "5" }
  ];

  const state = {
    currentStep: 0,
    completed: new Set(),
    selectedBrick: null,
    brick: "premium",
    sandProgress: 0,
    sandMilestone: 0,
    lineTransform: { x: 0, y: 0, scale: .91 },
    alignmentConfirmed: false,
    currentTool: null,
    finishingTool: "edge",
    scene: "white",
    pointerActive: false,
    rotating: false,
    panning: false,
    pointerStart: null,
    lastPointer: null,
    lastErrorAt: 0,
    progressUiAt: 0,
    modalOpen: false,
    crackCount: 0
  };

  const canvas = document.getElementById("brickCanvas");
  const canvasShell = document.getElementById("canvasShell");
  const toolList = document.getElementById("toolList");
  const stepRail = document.getElementById("stepRail");
  const stepContent = document.getElementById("stepContent");
  const nextButton = document.getElementById("nextButton");
  const quickCompleteButton = document.getElementById("quickCompleteButton");
  const resetStepButton = document.getElementById("resetStepButton");
  const taskProgressBar = document.getElementById("taskProgressBar");
  const taskProgressValue = document.getElementById("taskProgressValue");
  const taskProgressLabel = document.getElementById("taskProgressLabel");
  const overallBar = document.getElementById("overallBar");
  const overallLabel = document.getElementById("overallLabel");
  const overallPercent = document.getElementById("overallPercent");
  const canvasHint = document.getElementById("canvasHint");
  const processFeedback = document.getElementById("processFeedback");
  const stageToolCursor = document.getElementById("stageToolCursor");
  const guideButton = document.getElementById("guideButton");
  const cultureButton = document.getElementById("cultureButton");
  const cultureDrawer = document.getElementById("cultureDrawer");
  const drawerBackdrop = document.getElementById("drawerBackdrop");
  const closeCultureButton = document.getElementById("closeCultureButton");
  const infoModal = document.getElementById("infoModal");
  const closeModalButton = document.getElementById("closeModalButton");
  const modalVisual = document.getElementById("modalVisual");
  const modalKicker = document.getElementById("modalKicker");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const toastRegion = document.getElementById("toastRegion");
  const stagePanel = document.getElementById("stage");

  const patternModel = new window.BrickPatternLibrary.PatternModel(1000, 700);
  const renderer = new window.BrickStudioRenderer(canvas, patternModel);
  renderer.setLineTransform(state.lineTransform);

  const sandCoverage = new Uint8Array(42 * 30);
  let feedbackTimer = 0;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function icon(id) {
    return '<svg aria-hidden="true"><use href="#' + id + '"></use></svg>';
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getStep() {
    return STEPS[state.currentStep];
  }

  function renderStepRail() {
    stepRail.innerHTML = STEPS.map(function (step, index) {
      const complete = state.completed.has(index);
      const active = index === state.currentStep;
      const locked = index > state.currentStep && !complete;
      return [
        '<div class="step-item ' + (active ? "is-active " : "") + (complete ? "is-complete " : "") + (locked ? "is-locked" : "") + '" data-step="' + index + '">',
        '  <span class="step-number"><span>' + step.number + "</span></span>",
        '  <span class="step-name"><strong>' + step.short + "</strong><small>" + step.name + "</small></span>",
        "</div>"
      ].join("");
    }).join("");
  }

  function availableTools() {
    if (state.currentStep === 1) {
      return new Set(["sand"]);
    }
    if (state.currentStep === 3) {
      return new Set(["rough"]);
    }
    if (state.currentStep === 4) {
      return new Set(["fine"]);
    }
    if (state.currentStep === 5) {
      return new Set(["edge", "polish", "brush"]);
    }
    return new Set();
  }

  function renderTools() {
    const available = availableTools();
    toolList.innerHTML = TOOL_DEFINITIONS.map(function (tool) {
      const enabled = available.has(tool.id);
      const active = state.currentTool === tool.id;
      return [
        '<button class="tool-button ' + (active ? "is-active" : "") + '" type="button" data-tool="' + tool.id + '"',
        enabled ? "" : " disabled",
        ' title="' + tool.name + '">',
        '  <span class="tool-key">' + tool.key + "</span>",
        icon(tool.icon),
        "  <span>" + tool.name + "</span>",
        "</button>"
      ].join("");
    }).join("");
  }

  function setTool(tool) {
    const available = availableTools();
    if (tool && !available.has(tool)) {
      return;
    }
    state.currentTool = tool;
    renderer.setTool(tool);
    renderTools();
    updateCursorMode();
  }

  function updateCursorMode() {
    if (state.currentTool && state.currentStep !== 6) {
      stageToolCursor.dataset.tool = state.currentTool;
      stageToolCursor.classList.add("is-visible");
    } else {
      stageToolCursor.classList.remove("is-visible");
    }
  }

  function renderStepContent() {
    const step = state.currentStep;
    if (step === 0) {
      renderMaterialChoices();
    } else if (step === 1) {
      renderSandingContent();
    } else if (step === 2) {
      renderTraceContent();
    } else if (step === 3) {
      renderRoughContent();
    } else if (step === 4) {
      renderFineContent();
    } else if (step === 5) {
      renderFinishingContent();
    } else {
      renderDisplayContent();
    }
  }

  function renderMaterialChoices() {
    stepContent.innerHTML = [
      '<div class="choice-grid">',
      '  <button class="choice-card ' + (state.selectedBrick === "premium" ? "is-selected" : "") + '" type="button" data-brick="premium">',
      '    <span class="choice-thumb"></span>',
      '    <span><strong class="choice-title">优品青砖</strong><small class="choice-note">老城细泥青砖，砖质致密均匀<br>工艺容错率：高</small></span>',
      '    <span class="choice-check">' + icon("i-check") + "</span>",
      "  </button>",
      '  <button class="choice-card ' + (state.selectedBrick === "flawed" ? "is-selected" : "") + '" type="button" data-brick="flawed">',
      '    <span class="choice-thumb flawed"></span>',
      '    <span><strong class="choice-title">微瑕疵青砖</strong><small class="choice-note">带窑裂与细小暗伤，色调更朴拙<br>工艺容错率：中低</small></span>',
      '    <span class="choice-check">' + icon("i-check") + "</span>",
      "  </button>",
      "</div>",
      '<div class="metric-list">',
      '  <div class="metric-row"><span>砖体密度</span><span class="meter"><i style="width:' + (state.brick === "premium" ? "92%" : "73%") + '"></i></span></div>',
      '  <div class="metric-row"><span>表面均匀度</span><span class="meter"><i style="width:' + (state.brick === "premium" ? "89%" : "68%") + '"></i></span></div>',
      '  <div class="metric-row"><span>深度容错</span><strong id="toleranceValue">' + (state.brick === "premium" ? "22" : "13") + " 刀</strong></div>",
      "</div>",
      '<p class="instruction-note">微瑕疵砖并不会影响构图，但局部暗裂会降低可重复下刀次数，答辩演示建议先选优品青砖。</p>'
    ].join("");

    stepContent.querySelectorAll("[data-brick]").forEach(function (button) {
      button.addEventListener("click", function () {
        state.selectedBrick = button.dataset.brick;
        state.brick = button.dataset.brick;
        renderer.setBrick(state.brick);
        document.getElementById("materialStatus").textContent =
          (state.brick === "premium" ? "优品青砖" : "微瑕疵青砖") +
          " · 工艺容错率 " + (state.brick === "premium" ? "高" : "中低");
        renderMaterialChoices();
        updateProgressUi(true);
        showToast(state.brick === "premium"
          ? "已选优品青砖。砖体均匀，适合多层深浅浮雕。"
          : "已选微瑕疵青砖。请控制单点走刀次数，避免暗裂扩展。", "success");
      });
    });
  }

  function renderSandingContent() {
    stepContent.innerHTML = [
      '<div class="metric-list">',
      '  <div class="metric-row"><span>表面平整度</span><strong id="sandPercent">' + Math.round(state.sandProgress * 100) + "%</strong></div>",
      '  <div class="metric-row"><span>当前磨料</span><strong>细砂岩磨石</strong></div>',
      '  <div class="metric-row"><span>目标数值</span><strong>≥ 85%</strong></div>',
      "</div>",
      '<div class="action-row">',
      '  <button class="mini-action" type="button" id="resetSandInline">' + icon("i-reset") + "重置磨面</button>",
      "</div>",
      '<p class="instruction-note">按住鼠标左键并往复拖动。打磨不足时，“完成本步”不会解锁。</p>'
    ].join("");
    document.getElementById("resetSandInline").addEventListener("click", function () {
      resetCurrentStep();
    });
  }

  function renderTraceContent() {
    stepContent.innerHTML = [
      '<div class="metric-list">',
      '  <div class="metric-row"><span>底稿</span><strong>津派博古花鸟</strong></div>',
      '  <div class="metric-row"><span>缩放比例</span><strong id="traceScale">' + Math.round(state.lineTransform.scale * 100) + "%</strong></div>",
      '  <div class="metric-row"><span>隐藏数据层</span><strong>蒙版 / 深度</strong></div>',
      "</div>",
      '<div class="action-row">',
      '  <button class="mini-action" type="button" id="zoomOutButton">' + icon("i-zoom") + "缩小</button>",
      '  <button class="mini-action" type="button" id="zoomInButton">' + icon("i-zoom") + "放大</button>",
      "</div>",
      '<div class="action-row">',
      '  <button class="mini-action" type="button" id="centerLineButton">' + icon("i-trace") + "居中归位</button>",
      "</div>",
      '<div class="action-row">',
      '  <button class="mini-action" type="button" id="confirmAlignmentButton">' + icon(state.alignmentConfirmed ? "i-check" : "i-trace") + (state.alignmentConfirmed ? "已确认落样" : "确认落样") + "</button>",
      "</div>",
      '<p class="instruction-note">拖动底稿可直接平移，鼠标滚轮缩放。三层底图在后台同步移动，雕刻判定不会偏差。</p>'
    ].join("");
    document.getElementById("zoomInButton").addEventListener("click", function () { adjustTraceZoom(1.08); });
    document.getElementById("zoomOutButton").addEventListener("click", function () { adjustTraceZoom(.92); });
    document.getElementById("centerLineButton").addEventListener("click", function () {
      state.lineTransform.x = 0;
      state.lineTransform.y = 0;
      state.lineTransform.scale = .91;
      state.alignmentConfirmed = false;
      renderer.setLineTransform(state.lineTransform);
      renderTraceContent();
      updateProgressUi(true);
    });
    document.getElementById("confirmAlignmentButton").addEventListener("click", function () {
      state.alignmentConfirmed = true;
      renderTraceContent();
      updateProgressUi(true);
      showToast("落样已确认。后台蒙版与深度图已同步锁定。", "success");
    });
  }

  function adjustTraceZoom(factor) {
    state.lineTransform.scale = clamp(state.lineTransform.scale * factor, .72, 1.12);
    state.alignmentConfirmed = false;
    renderer.setLineTransform(state.lineTransform);
    renderTraceContent();
    updateProgressUi(true);
  }

  function renderRoughContent() {
    const progress = renderer.getProgress("rough");
    stepContent.innerHTML = [
      '<div class="metric-list">',
      '  <div class="metric-row"><span>去地覆盖</span><strong id="roughInlinePercent">' + Math.round(progress * 100) + "%</strong></div>",
      '  <div class="metric-row"><span>目标工艺值</span><strong>78%</strong></div>',
      '  <div class="metric-row"><span>允许区域</span><strong>背景黑色地子</strong></div>',
      "</div>",
      '<p class="instruction-note">拖动粗刻刀持续下凹。若触碰纹样主体或回纹边框，系统会震动提示并自动收刀。</p>'
    ].join("");
  }

  function renderFineContent() {
    const progress = renderer.getProgress("fine");
    stepContent.innerHTML = [
      '<div class="metric-list">',
      '  <div class="metric-row"><span>主体细雕</span><strong id="fineInlinePercent">' + Math.round(progress * 100) + "%</strong></div>",
      '  <div class="metric-row"><span>目标工艺值</span><strong>72%</strong></div>',
      '  <div class="metric-row"><span>崩裂记录</span><strong id="crackInlineValue">' + state.crackCount + " 处</strong></div>",
      "</div>",
      '<p class="instruction-note">刀口将读取深度灰度：浅色浅雕、深色深雕。同一处反复停留会触发崩砖并生成裂纹。</p>'
    ].join("");
  }

  function renderFinishingContent() {
    const stages = [
      { id: "edge", label: "修边刀整理轮廓", icon: "i-edge" },
      { id: "polish", label: "磨石整体抛光", icon: "i-sand" },
      { id: "brush", label: "毛刷清除砖灰", icon: "i-brush" }
    ];
    stepContent.innerHTML = [
      '<div class="finish-stage-list">',
      stages.map(function (stage) {
        const value = renderer.getProgress(stage.id);
        const active = state.finishingTool === stage.id;
        const done = value >= .58;
        return [
          '<div class="finish-stage-item ' + (active ? "is-active " : "") + (done ? "is-done" : "") + '">',
          '  <span class="finish-icon">' + icon(stage.icon) + "</span>",
          "  <span>" + stage.label + "</span>",
          '  <span class="finish-value">' + Math.round(value * 100) + "%</span>",
          "</div>"
        ].join("");
      }).join(""),
      "</div>",
      '<p class="instruction-note">左侧工具按顺序切换。修边只认轮廓，抛光覆盖砖面，毛刷只清除纹样与边框转折处的砖灰。</p>'
    ].join("");
  }

  function renderDisplayContent() {
    stepContent.innerHTML = [
      '<div class="completion-banner">',
      "  <strong>七道工序已完成</strong>",
      "  <span>成品包含完整回纹边框、中心牡丹飞鸟、左右宝瓶书卷与底部卷草层次。</span>",
      "</div>",
      '<div class="scene-grid" style="margin-top:10px">',
      '  <button class="scene-button ' + (state.scene === "white" ? "is-active" : "") + '" type="button" data-scene="white">',
      '    <span class="scene-preview white"></span><span>纯白展台</span>',
      "  </button>",
      '  <button class="scene-button ' + (state.scene === "courtyard" ? "is-active" : "") + '" type="button" data-scene="courtyard">',
      '    <span class="scene-preview courtyard"></span><span>四合院影壁</span>',
      "  </button>",
      "</div>",
      '<div class="action-row">',
      '  <button class="mini-action" type="button" id="saveImageButton">' + icon("i-camera") + "保存成品截图</button>",
      '  <button class="mini-action" type="button" id="resetViewButton">' + icon("i-rotate") + "正视成品</button>",
      "</div>",
      '<div class="action-row">',
      '  <button class="mini-action" type="button" id="compareButton">' + icon("i-book") + "文物同款对照</button>",
      '  <button class="mini-action" type="button" id="processInfoButton">' + icon("i-info") + "工艺介绍</button>",
      "</div>"
    ].join("");

    stepContent.querySelectorAll("[data-scene]").forEach(function (button) {
      button.addEventListener("click", function () {
        state.scene = button.dataset.scene;
        document.body.classList.toggle("scene-courtyard", state.scene === "courtyard");
        renderDisplayContent();
      });
    });
    document.getElementById("saveImageButton").addEventListener("click", saveCompositeImage);
    document.getElementById("resetViewButton").addEventListener("click", function () {
      renderer.resetView();
    });
    document.getElementById("compareButton").addEventListener("click", showComparisonModal);
    document.getElementById("processInfoButton").addEventListener("click", showProcessModal);
  }

  function renderStepMeta() {
    const step = getStep();
    document.getElementById("stageStep").textContent = "步骤 " + step.number;
    document.getElementById("stageTitle").textContent = step.name;
    document.getElementById("stageStatus").textContent = completionLabel();
    document.getElementById("stepKicker").textContent = step.kicker;
    document.getElementById("stepHeading").textContent = step.heading;
    document.getElementById("stepDescription").textContent = step.description;
    document.getElementById("knowledgeTitle").textContent = step.knowledge.title;
    document.getElementById("knowledgeText").textContent = step.knowledge.text;
    canvasHint.querySelector("strong").textContent = step.hintTitle;
    canvasHint.querySelector("span").textContent = step.hintText;
    document.getElementById("stageTip").textContent = step.task;
    document.getElementById("taskProgressLabel").textContent = step.task;
    document.querySelector(".stage-status").classList.toggle("is-ready", canAdvance(false));
  }

  function completionLabel() {
    if (state.currentStep === 0) {
      return state.selectedBrick ? "砖坯已选定" : "等待选料";
    }
    if (state.currentStep === 1) {
      return state.sandProgress >= .85 ? "磨面合格" : "持续打磨中";
    }
    if (state.currentStep === 2) {
      return state.alignmentConfirmed ? "底稿已锁定" : "等待落样";
    }
    if (state.currentStep === 3) {
      return renderer.getProgress("rough") >= .78 ? "去地达标" : "粗雕进行中";
    }
    if (state.currentStep === 4) {
      return renderer.getProgress("fine") >= .72 ? "细雕达标" : "细雕进行中";
    }
    if (state.currentStep === 5) {
      return renderer.getProgress("edge") >= .58 &&
        renderer.getProgress("polish") >= .58 &&
        renderer.getProgress("brush") >= .58
        ? "精修完成"
        : "精加工序中";
    }
    return "成品展示";
  }

  function canAdvance(showReason) {
    const result = { ok: false, reason: "" };
    if (state.currentStep === 0) {
      result.ok = Boolean(state.selectedBrick);
      result.reason = "请先选择一款青砖坯。";
    } else if (state.currentStep === 1) {
      result.ok = state.sandProgress >= .85;
      result.reason = "砖面打磨不足，仍需往复覆盖磨石。";
    } else if (state.currentStep === 2) {
      result.ok = state.alignmentConfirmed;
      result.reason = "请先确认整张线稿的落样位置。";
    } else if (state.currentStep === 3) {
      result.ok = renderer.getProgress("rough") >= .78;
      result.reason = "背景地子尚未达到粗雕工艺值。";
    } else if (state.currentStep === 4) {
      result.ok = renderer.getProgress("fine") >= .72;
      result.reason = "纹样主体细雕覆盖率不足。";
    } else if (state.currentStep === 5) {
      result.ok = renderer.getProgress("edge") >= .58 &&
        renderer.getProgress("polish") >= .58 &&
        renderer.getProgress("brush") >= .58;
      result.reason = "修边、抛光、清灰三项必须全部完成。";
    } else {
      result.ok = true;
    }
    if (showReason && !result.ok) {
      showToast(result.reason, "warning");
    }
    return result.ok;
  }

  function currentProgress() {
    if (state.currentStep === 0) {
      return state.selectedBrick ? 1 : 0;
    }
    if (state.currentStep === 1) {
      return state.sandProgress;
    }
    if (state.currentStep === 2) {
      return state.alignmentConfirmed ? 1 : .35;
    }
    if (state.currentStep === 3) {
      return renderer.getProgress("rough");
    }
    if (state.currentStep === 4) {
      return renderer.getProgress("fine");
    }
    if (state.currentStep === 5) {
      return (
        Math.min(1, renderer.getProgress("edge") / .58) +
        Math.min(1, renderer.getProgress("polish") / .58) +
        Math.min(1, renderer.getProgress("brush") / .58)
      ) / 3;
    }
    return 1;
  }

  function updateProgressUi(force) {
    const now = performance.now();
    if (!force && now - state.progressUiAt < 70) {
      return;
    }
    state.progressUiAt = now;
    const progress = clamp(currentProgress(), 0, 1);
    taskProgressBar.style.width = Math.round(progress * 100) + "%";
    taskProgressValue.textContent = Math.round(progress * 100) + "%";
    const available = canAdvance(false);
    nextButton.disabled = !available;
    nextButton.querySelector("span").textContent = state.currentStep === 6 ? "查看成品信息" : "完成本步";
    quickCompleteButton.disabled = state.currentStep === 6;
    quickCompleteButton.querySelector("span").textContent =
      state.currentStep === 6 ? "本步骤已完成" : "一键完成本步骤";
    document.querySelector(".stage-status").classList.toggle("is-ready", available);

    const completedBase = state.completed.size;
    const overall = state.currentStep === 6
      ? 1
      : clamp((completedBase + progress * .92) / 7, 0, .99);
    overallBar.style.width = Math.round(overall * 100) + "%";
    overallLabel.textContent = "工序 " + (state.currentStep + 1) + " / 7";
    overallPercent.textContent = Math.round(overall * 100) + "%";

    const sandValue = document.getElementById("sandPercent");
    if (sandValue) {
      sandValue.textContent = Math.round(state.sandProgress * 100) + "%";
    }
    const roughValue = document.getElementById("roughInlinePercent");
    if (roughValue) {
      roughValue.textContent = Math.round(renderer.getProgress("rough") * 100) + "%";
    }
    const fineValue = document.getElementById("fineInlinePercent");
    if (fineValue) {
      fineValue.textContent = Math.round(renderer.getProgress("fine") * 100) + "%";
      document.getElementById("crackInlineValue").textContent = state.crackCount + " 处";
    }
    const traceScale = document.getElementById("traceScale");
    if (traceScale) {
      traceScale.textContent = Math.round(state.lineTransform.scale * 100) + "%";
    }
  }

  function renderStep() {
    const step = getStep();
    bodyScrollTop();
    renderStepRail();
    renderStepMeta();
    renderTools();
    renderStepContent();
    updateCursorMode();
    updateProgressUi(true);
    renderer.setStep(state.currentStep);
    setViewBoundsForStep();
    document.body.classList.toggle("workflow-complete", state.currentStep === 6);
    if (state.currentStep === 6) {
      renderer.setLineTransform({ x: 0, y: 0, scale: .91 });
    }
  }

  function bodyScrollTop() {
    const panel = document.querySelector(".panel-scroll");
    if (panel) {
      panel.scrollTop = 0;
    }
  }

  function setViewBoundsForStep() {
    if (state.currentStep === 0) {
      renderer.setViewBounds(.72, .26);
      renderer.setOrientation(-.18, -.055, false);
    } else if (state.currentStep === 1) {
      renderer.setViewBounds(.32, .15);
      renderer.setOrientation(0, -.02, false);
    } else if (state.currentStep === 2) {
      renderer.setViewBounds(.24, .12);
      renderer.setOrientation(0, 0, false);
    } else if (state.currentStep === 3 || state.currentStep === 4) {
      renderer.setViewBounds(.18, .1);
      renderer.setOrientation(0, 0, false);
    } else if (state.currentStep === 5) {
      renderer.setViewBounds(.28, .14);
      renderer.setOrientation(-.05, -.02, false);
    } else {
      renderer.setViewBounds(Math.PI, .42);
      renderer.setOrientation(-.12, -.045, false);
    }
  }

  function advanceStep() {
    if (!canAdvance(true)) {
      return;
    }
    if (state.currentStep === 6) {
      showProcessModal();
      return;
    }
    state.completed.add(state.currentStep);
    state.currentStep += 1;
    state.pointerActive = false;
    state.rotating = false;
    state.panning = false;
    setToolForStep();
    renderStep();
    showToast("工序 " + STEPS[state.currentStep].number + " 已解锁：" + STEPS[state.currentStep].name, "success");
    if (state.currentStep === 5) {
      showToast("进入精加工阶段，请按修边、抛光、清灰的顺序切换工具。", "success");
    }
  }

  function setToolForStep() {
    if (state.currentStep === 1) {
      state.currentTool = "sand";
    } else if (state.currentStep === 3) {
      state.currentTool = "rough";
    } else if (state.currentStep === 4) {
      state.currentTool = "fine";
    } else if (state.currentStep === 5) {
      state.currentTool = state.finishingTool || "edge";
    } else {
      state.currentTool = null;
    }
    renderer.setTool(state.currentTool);
  }

  function resetCurrentStep() {
    if (state.currentStep === 0) {
      state.selectedBrick = null;
      state.brick = "premium";
      renderer.setBrick("premium");
      document.getElementById("materialStatus").textContent = "青砖未选 · 工艺容错率 --";
    } else if (state.currentStep === 1) {
      state.sandProgress = 0;
      state.sandMilestone = 0;
      sandCoverage.fill(0);
      renderer.resetToolProgress("sand");
    } else if (state.currentStep === 2) {
      state.lineTransform = { x: 0, y: 0, scale: .91 };
      state.alignmentConfirmed = false;
      renderer.setLineTransform(state.lineTransform);
    } else if (state.currentStep === 3) {
      renderer.resetToolProgress("rough");
    } else if (state.currentStep === 4) {
      renderer.resetToolProgress("fine");
      state.crackCount = 0;
    } else if (state.currentStep === 5) {
      renderer.resetToolProgress("edge");
      renderer.resetToolProgress("polish");
      renderer.resetToolProgress("brush");
    } else {
      state.scene = "white";
      document.body.classList.remove("scene-courtyard");
      renderer.resetView();
    }
    renderStepContent();
    updateProgressUi(true);
    showToast("当前工序已重置。", "warning");
  }

  function completeCurrentStep() {
    if (state.currentStep === 6) {
      return;
    }

    if (state.currentStep === 0) {
      state.selectedBrick = state.selectedBrick || "premium";
      state.brick = state.selectedBrick;
      renderer.setBrick(state.brick);
      document.getElementById("materialStatus").textContent =
        (state.brick === "premium" ? "优品青砖" : "微瑕疵青砖") +
        " · 工艺容错率 " + (state.brick === "premium" ? "高" : "中低");
    } else if (state.currentStep === 1) {
      sandCoverage.fill(1);
      state.sandProgress = 1;
      state.sandMilestone = 3;
      renderer.setSandProgress(1);
    } else if (state.currentStep === 2) {
      state.lineTransform.x = 0;
      state.lineTransform.y = 0;
      state.lineTransform.scale = .91;
      state.alignmentConfirmed = true;
      renderer.setLineTransform(state.lineTransform);
    } else if (state.currentStep === 3) {
      renderer.completeToolProgress("rough");
    } else if (state.currentStep === 4) {
      renderer.completeToolProgress("fine");
      state.crackCount = 0;
    } else if (state.currentStep === 5) {
      renderer.completeToolProgress("edge");
      renderer.completeToolProgress("polish");
      renderer.completeToolProgress("brush");
    }

    renderStepContent();
    updateProgressUi(true);
    triggerFeedback("已按标准工艺完成本步骤。系统只处理本工序对应区域，其他内容保持不变。", false);
    showToast("本步骤已一键完成，可继续进入下一工序。", "success");
  }

  function showToast(message, tone) {
    const toast = document.createElement("div");
    toast.className = "toast " + (tone || "");
    toast.textContent = message;
    toastRegion.appendChild(toast);
    window.setTimeout(function () {
      toast.remove();
    }, 4300);
  }

  function triggerFeedback(message, error) {
    window.clearTimeout(feedbackTimer);
    processFeedback.textContent = message;
    processFeedback.classList.toggle("is-error", Boolean(error));
    processFeedback.classList.add("is-visible");
    feedbackTimer = window.setTimeout(function () {
      processFeedback.classList.remove("is-visible");
    }, error ? 1900 : 1150);

    if (error) {
      canvasShell.classList.remove("shake");
      void canvasShell.offsetWidth;
      canvasShell.classList.add("shake");
      stagePanel.classList.remove("is-flashing");
      void stagePanel.offsetWidth;
      stagePanel.classList.add("is-flashing");
      window.setTimeout(function () {
        canvasShell.classList.remove("shake");
        stagePanel.classList.remove("is-flashing");
      }, 520);
    }
  }

  function setErrorGuide(message, title) {
    const guide = document.getElementById("errorGuide");
    const content = document.getElementById("errorGuideContent");
    if (!message) {
      guide.classList.remove("has-error");
      content.innerHTML = "<p>当前无操作错误。若发生错区下刀、过度深挖或工序未完成，系统会给出针对性指导。</p>";
      return;
    }
    guide.classList.add("has-error");
    content.innerHTML = "<strong>" + escapeHtml(title || "工艺纠错") + "</strong><p>" + escapeHtml(message) + "</p>";
  }

  function markCoverage(grid, modelPoint, radius) {
    const columns = 42;
    const rows = 30;
    const cellWidth = 1000 / columns;
    const cellHeight = 700 / rows;
    const centerColumn = Math.floor(modelPoint.x / cellWidth);
    const centerRow = Math.floor(modelPoint.y / cellHeight);
    const radiusX = Math.ceil(radius / cellWidth);
    const radiusY = Math.ceil(radius / cellHeight);

    for (let row = centerRow - radiusY; row <= centerRow + radiusY; row += 1) {
      for (let column = centerColumn - radiusX; column <= centerColumn + radiusX; column += 1) {
        if (row < 0 || row >= rows || column < 0 || column >= columns) {
          continue;
        }
        if (Math.hypot((column - centerColumn) * cellWidth, (row - centerRow) * cellHeight) > radius) {
          continue;
        }
        grid[row * columns + column] = 1;
      }
    }
  }

  function countCoverage(grid) {
    let count = 0;
    for (let i = 0; i < grid.length; i += 1) {
      count += grid[i] ? 1 : 0;
    }
    return count;
  }

  function handleSanding(point) {
    const modelPoint = renderer.screenToModel(point);
    if (modelPoint.x < 0 || modelPoint.x > 1000 || modelPoint.y < 0 || modelPoint.y > 700) {
      return;
    }
    markCoverage(sandCoverage, modelPoint, 66);
    state.sandProgress = clamp(countCoverage(sandCoverage) / sandCoverage.length, 0, 1);
    renderer.setSandProgress(state.sandProgress);
    renderer.addDustPoint(modelPoint, "sand", 2);

    if (state.sandProgress >= .25 && state.sandMilestone < 1) {
      state.sandMilestone = 1;
      triggerFeedback("粗砂已去除，砖面开始显露细密青灰色。", false);
    } else if (state.sandProgress >= .55 && state.sandMilestone < 2) {
      state.sandMilestone = 2;
      triggerFeedback("砖面渐趋平整，继续覆盖边缘与四角。", false);
    } else if (state.sandProgress >= .85 && state.sandMilestone < 3) {
      state.sandMilestone = 3;
      triggerFeedback("砖面平整度达到落样标准。", false);
    }
    updateProgressUi(false);
  }

  function resetPointerErrors() {
    setErrorGuide("", "");
  }

  function handleToolPoint(point, pressure) {
    if (state.currentStep === 1) {
      handleSanding(point);
      return;
    }

    const result = renderer.applyTool(state.currentTool, point, pressure);
    if (!result.ok) {
      const now = performance.now();
      if (result.type !== "outside" && now - state.lastErrorAt > 780) {
        state.lastErrorAt = now;
        triggerFeedback(result.message, true);
        setErrorGuide(result.message, result.type === "overcarve" ? "过度深挖" : "错区下刀");
        if (result.type === "overcarve") {
          state.crackCount += 1;
        }
      }
      return;
    }

    if (result.type === "carve") {
      resetPointerErrors();
      if (result.progress >= .78 && state.currentStep === 3 && !state.roughMilestone) {
        state.roughMilestone = true;
        triggerFeedback("背景地子已达到粗雕深度，完整纹样轮廓已经浮出。", false);
      }
      if (result.progress >= .72 && state.currentStep === 4 && !state.fineMilestone) {
        state.fineMilestone = true;
        triggerFeedback("主体高低层次已经建立，可进入修边与精加工。", false);
      }
    } else if (result.type === "finish") {
      resetPointerErrors();
    } else if (result.type === "cleaning-empty") {
      const now = performance.now();
      if (now - state.lastErrorAt > 950) {
        state.lastErrorAt = now;
        setErrorGuide(result.message, "清灰位置");
      }
      return;
    }
    updateProgressUi(false);
  }

  function eventPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  function interpolatePoints(from, to, spacing) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.ceil(length / spacing));
    const points = [];
    for (let i = 1; i <= steps; i += 1) {
      const t = i / steps;
      points.push({
        x: from.x + dx * t,
        y: from.y + dy * t
      });
    }
    return points;
  }

  function beginPointer(event) {
    if (event.button !== 0) {
      return;
    }
    const point = eventPoint(event);
    state.pointerActive = true;
    state.pointerStart = point;
    state.lastPointer = point;
    canvas.setPointerCapture(event.pointerId);
    if (state.currentStep === 0 || state.currentStep === 6) {
      state.rotating = true;
      state.panning = false;
    } else if (state.currentStep === 2) {
      state.panning = true;
      state.rotating = false;
      state.alignmentConfirmed = false;
      updateProgressUi(true);
    } else if (state.currentTool) {
      handleToolPoint(point, event.pressure || .42);
    }
  }

  function movePointer(event) {
    const point = eventPoint(event);
    const geometry = renderer.getGeometry();
    const materialScaleX = geometry.faceWidth / 1000;
    const materialScaleY = geometry.faceHeight / 700;

    stageToolCursor.style.left = point.x + "px";
    stageToolCursor.style.top = point.y + "px";

    if (!state.pointerActive) {
      return;
    }

    const previous = state.lastPointer || point;
    const dx = point.x - previous.x;
    const dy = point.y - previous.y;

    if (state.rotating) {
      renderer.rotateBy(dx, dy);
    } else if (state.panning) {
      state.lineTransform.x += dx / Math.max(.12, materialScaleX);
      state.lineTransform.y += dy / Math.max(.12, materialScaleY);
      state.lineTransform.x = clamp(state.lineTransform.x, -180, 180);
      state.lineTransform.y = clamp(state.lineTransform.y, -140, 140);
      renderer.setLineTransform(state.lineTransform);
      updateProgressUi(false);
    } else if (state.currentTool) {
      const spacing = state.currentTool === "rough" ? 12 : state.currentTool === "fine" ? 7 : 10;
      const points = interpolatePoints(previous, point, spacing);
      points.forEach(function (sample) {
        handleToolPoint(sample, event.pressure || .42);
      });
    }
    state.lastPointer = point;
  }

  function endPointer(event) {
    state.pointerActive = false;
    state.rotating = false;
    state.panning = false;
    state.lastPointer = null;
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
    updateProgressUi(true);
  }

  function handleWheel(event) {
    if (state.currentStep !== 2) {
      return;
    }
    event.preventDefault();
    adjustTraceZoom(event.deltaY < 0 ? 1.065 : .94);
  }

  function saveCompositeImage() {
    const exportCanvas = renderer.exportComposite(state.scene);
    const filename = "津派博古花鸟砖雕_" + new Date().toISOString().slice(0, 10) + ".png";
    const dataUrl = exportCanvas.toDataURL("image/png");
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches ||
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

    if (isTouchDevice) {
      openMobileSaveModal(dataUrl, filename);
      return;
    }

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast("成品截图已保存为高清 PNG 文件。", "success");
  }

  function openMobileSaveModal(dataUrl, filename) {
    infoModal.hidden = false;
    state.modalOpen = true;
    modalKicker.textContent = "保存成品图片";
    modalTitle.textContent = "砖雕成品已生成";
    modalVisual.innerHTML = '<img class="mobile-save-image" alt="津派博古花鸟砖雕成品截图">';
    const image = modalVisual.querySelector("img");
    image.src = dataUrl;
    modalBody.innerHTML = [
      "<p>手机浏览器可能限制自动下载。可长按左侧图片保存到相册，也可以点击下方按钮打开系统分享或保存面板。</p>",
      '<div class="action-row">',
      '  <button class="mini-action" type="button" id="shareImageButton">' + icon("i-camera") + "分享 / 保存图片</button>",
      "</div>",
      '<div class="action-row">',
      '  <a class="mini-action" id="downloadImageLink" download="' + escapeHtml(filename) + '">' + icon("i-check") + "直接下载 PNG</a>",
      "</div>"
    ].join("");
    const downloadLink = document.getElementById("downloadImageLink");
    downloadLink.href = dataUrl;
    document.getElementById("shareImageButton").addEventListener("click", function () {
      shareCompositeImage(dataUrl, filename);
    });
  }

  async function shareCompositeImage(dataUrl, filename) {
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "津派博古花鸟砖雕",
          text: "天津非遗津派砖雕数字成品"
        });
        return;
      }
      showToast("当前浏览器不支持直接分享，请长按图片保存到相册。", "warning");
    } catch (error) {
      if (error && error.name !== "AbortError") {
        showToast("未能打开系统分享，请长按图片保存。", "warning");
      }
    }
  }

  function prepareModalVisual() {
    modalVisual.innerHTML = '<canvas aria-label="津派博古花鸟砖雕线稿"></canvas>';
    const miniCanvas = modalVisual.querySelector("canvas");
    window.requestAnimationFrame(function () {
      renderer.drawReference(miniCanvas);
    });
  }

  function showComparisonModal() {
    modalKicker.textContent = "文物同款对照";
    modalTitle.textContent = "津派博古花鸟砖雕";
    modalBody.innerHTML = [
      "<p>对照图展示传统矩形砖雕的典型构图：中心花卉与飞鸟形成视觉核心，左右宝瓶、书卷构成均衡骨架，底部卷草承托画面，外围回纹收束边界。</p>",
      "<ul>",
      "<li>构图特征：满而不塞，四角留气口。</li>",
      "<li>雕刻层次：高浮雕花心、中浮雕飞鸟、浅浮雕书卷与卷草。</li>",
      "<li>材质特征：青灰砖体、自然细孔、含蓄柔光。</li>",
      "</ul>",
      '<p class="instruction-note">本文物对照为数字工艺复原图，用于说明造型体系与工序判定，不替代馆藏实物测绘。</p>'
    ].join("");
    openModal();
  }

  function showProcessModal() {
    modalKicker.textContent = "工艺介绍";
    modalTitle.textContent = "七道工序，闭环成器";
    modalBody.innerHTML = [
      "<p>系统按津派砖雕常见流程依次锁定七道工序：选料、打磨、落样、粗雕去地、细雕修纹、修边抛光清灰、成品展示。</p>",
      "<ul>",
      "<li>选料与磨面决定砖体基础与后续容错。</li>",
      "<li>线稿、区域蒙版、深度灰度图始终同步。</li>",
      "<li>粗刻只去背景，细刻只塑主体，修边只整理轮廓。</li>",
      "<li>深度上限与崩裂机制防止乱刻、刻穿与畸形。</li>",
      "</ul>"
    ].join("");
    openModal();
  }

  function showGuideModal() {
    modalKicker.textContent = "操作引导";
    modalTitle.textContent = "按工序使用对应工具";
    modalBody.innerHTML = [
      "<p>拖动砖体可观察材质；进入雕刻步骤后，按住鼠标左键沿底稿走刀。顶栏进度条显示当前工序完成度。</p>",
      "<ul>",
      "<li>步骤 1：选择青砖坯，砖质影响崩裂容错。</li>",
      "<li>步骤 2：按住磨石覆盖整个砖面。</li>",
      "<li>步骤 3：拖动平移线稿，滚轮缩放，最后确认落样。</li>",
      "<li>步骤 4：粗刻刀只进入黑色背景地子。</li>",
      "<li>步骤 5：细刻刀只进入纹样主体，避免同一处过深。</li>",
      "<li>步骤 6：依次完成修边、抛光、清灰。</li>",
      "<li>步骤 7：旋转成品、切换场景并保存截图。</li>",
      "</ul>"
    ].join("");
    openModal();
  }

  function openModal() {
    infoModal.hidden = false;
    state.modalOpen = true;
    prepareModalVisual();
  }

  function closeModal() {
    infoModal.hidden = true;
    state.modalOpen = false;
    modalVisual.innerHTML = "";
  }

  function openCultureDrawer() {
    cultureDrawer.classList.add("is-open");
    cultureDrawer.setAttribute("aria-hidden", "false");
    drawerBackdrop.hidden = false;
  }

  function closeCultureDrawer() {
    cultureDrawer.classList.remove("is-open");
    cultureDrawer.setAttribute("aria-hidden", "true");
    drawerBackdrop.hidden = true;
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      closeModal();
      closeCultureDrawer();
      return;
    }
    if (state.modalOpen || cultureDrawer.classList.contains("is-open")) {
      return;
    }

    const numeric = Number(event.key);
    if (numeric >= 1 && numeric <= 5) {
      const tool = TOOL_DEFINITIONS[numeric - 1];
      setTool(tool.id);
    } else if (event.key.toLowerCase() === "r") {
      resetCurrentStep();
    } else if (event.key === "Enter" && !nextButton.disabled) {
      advanceStep();
    }
  }

  function bindEvents() {
    quickCompleteButton.addEventListener("click", completeCurrentStep);
    nextButton.addEventListener("click", advanceStep);
    resetStepButton.addEventListener("click", resetCurrentStep);
    toolList.addEventListener("click", function (event) {
      const button = event.target.closest("[data-tool]");
      if (!button || button.disabled) {
        return;
      }
      const tool = button.dataset.tool;
      setTool(tool);
      if (state.currentStep === 5 && (tool === "edge" || tool === "polish" || tool === "brush")) {
        state.finishingTool = tool;
        renderFinishingContent();
      }
    });
    canvas.addEventListener("pointerdown", beginPointer);
    canvas.addEventListener("pointermove", movePointer);
    canvas.addEventListener("pointerup", endPointer);
    canvas.addEventListener("pointercancel", endPointer);
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("pointerenter", function () {
      if (state.currentTool && state.currentStep !== 6) {
        stageToolCursor.classList.add("is-visible");
      }
    });
    canvas.addEventListener("pointerleave", function () {
      if (!state.pointerActive) {
        stageToolCursor.classList.remove("is-visible");
      }
    });
    guideButton.addEventListener("click", showGuideModal);
    cultureButton.addEventListener("click", openCultureDrawer);
    closeCultureButton.addEventListener("click", closeCultureDrawer);
    drawerBackdrop.addEventListener("click", closeCultureDrawer);
    closeModalButton.addEventListener("click", closeModal);
    infoModal.addEventListener("click", function (event) {
      if (event.target === infoModal) {
        closeModal();
      }
    });
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", function () {
      renderer.resize();
    });
  }

  function animate(timestamp) {
    const delta = Math.min(.05, Math.max(.001, (timestamp - (animate.previous || timestamp)) / 1000));
    animate.previous = timestamp;
    renderer.update(delta);
    renderer.render();
    window.requestAnimationFrame(animate);
  }

  function initialize() {
    bindEvents();
    renderer.setBrick(state.brick);
    setToolForStep();
    renderStep();
    window.BrickStudioApp = {
      state: state,
      renderer: renderer,
      steps: STEPS,
      advanceStep: advanceStep,
      resetCurrentStep: resetCurrentStep,
      completeCurrentStep: completeCurrentStep,
      renderStep: renderStep,
      setTool: setTool
    };
    setInterval(function () {
      updateProgressUi(true);
      if (state.currentStep === 5) {
        renderFinishingContent();
      }
    }, 600);
    window.requestAnimationFrame(animate);
  }

  initialize();
}());
