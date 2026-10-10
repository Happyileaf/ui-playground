(function () {
  "use strict";

  var layer = document.getElementById("watermarkLayer");
  var textInput = document.getElementById("wmText");
  var userInput = document.getElementById("wmUser");
  var opacityInput = document.getElementById("wmOpacity");
  var fontSizeInput = document.getElementById("wmFontSize");
  var rotateInput = document.getElementById("wmRotate");
  var opacityVal = document.getElementById("opacityVal");
  var fontSizeVal = document.getElementById("fontSizeVal");
  var rotateVal = document.getElementById("rotateVal");
  var tamperBtn = document.getElementById("tamperBtn");
  var guardStatus = document.getElementById("guardStatus");

  var CELL_W = 260;
  var CELL_H = 160;
  var DEBOUNCE_MS = 120;

  var state = {
    text: textInput.value,
    user: userInput.value,
    opacity: Number(opacityInput.value),
    fontSize: Number(fontSizeInput.value),
    rotate: Number(rotateInput.value)
  };

  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  var currentDataUrl = "";
  var restoring = false;
  var healTimer = null;
  var debounceTimer = null;

  function clampAlpha(value) {
    var num = Number(value);
    if (isNaN(num)) return "0.1";
    return num.toFixed(2);
  }

  function buildWatermarkDataUrl() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = CELL_W * dpr;
    canvas.height = CELL_H * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, CELL_W, CELL_H);

    var content = state.text;
    if (state.user) {
      content += " · " + state.user;
    }

    ctx.save();
    ctx.translate(CELL_W / 2, CELL_H / 2);
    ctx.rotate((state.rotate * Math.PI) / 180);
    ctx.font = "600 " + state.fontSize + 'px "PingFang SC", "Microsoft YaHei", "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(226, 232, 255, " + clampAlpha(state.opacity) + ")";
    ctx.fillText(content, 0, 0);
    ctx.restore();

    return canvas.toDataURL("image/png");
  }

  function isLayerIntact() {
    if (!layer || !layer.parentNode) return false;
    if (getComputedStyle(layer).position !== "fixed") return false;
    if (getComputedStyle(layer).pointerEvents !== "none") return false;
    if (getComputedStyle(layer).display === "none") return false;

    var backgroundImage = layer.style.backgroundImage || "";
    return backgroundImage.indexOf(currentDataUrl) !== -1;
  }

  function applyLayerStyle() {
    layer.setAttribute("aria-hidden", "true");
    layer.style.cssText =
      "position:fixed;inset:0;z-index:50;pointer-events:none;" +
      'background-image:url("' + currentDataUrl + '");background-repeat:repeat;';
  }

  function render() {
    restoring = true;
    currentDataUrl = buildWatermarkDataUrl();

    if (!layer.parentNode) {
      document.body.appendChild(layer);
    }

    applyLayerStyle();

    requestAnimationFrame(function () {
      restoring = false;
    });
  }

  function scheduleRender() {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(function () {
      debounceTimer = null;
      syncStateFromInputs();
      render();
    }, DEBOUNCE_MS);
  }

  function setStatus(kind, message) {
    guardStatus.className = "guard-status " + kind;
    guardStatus.textContent = message;
  }

  function selfHeal() {
    if (restoring) return;

    if (healTimer) {
      clearTimeout(healTimer);
    }

    setStatus("is-healed", "水印防护：已自愈");

    healTimer = setTimeout(function () {
      render();
      healTimer = null;
      setStatus("is-ok", "水印防护：正常");
    }, 600);
  }

  var layerObserver = new MutationObserver(function (mutations) {
    if (restoring) return;
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].type === "attributes" && !isLayerIntact()) {
        selfHeal();
        break;
      }
    }
  });

  var bodyObserver = new MutationObserver(function (mutations) {
    if (restoring) return;
    for (var i = 0; i < mutations.length; i++) {
      var removed = mutations[i].removedNodes;
      for (var j = 0; j < removed.length; j++) {
        if (removed[j] === layer || (removed[j].nodeType === 1 && removed[j].contains && removed[j].contains(layer))) {
          selfHeal();
          return;
        }
      }
    }
  });

  function syncStateFromInputs() {
    state.text = textInput.value.trim() || "内部机密";
    state.user = userInput.value.trim();
    state.opacity = Number(opacityInput.value);
    state.fontSize = Number(fontSizeInput.value);
    state.rotate = Number(rotateInput.value);

    opacityVal.textContent = state.opacity.toFixed(2);
    fontSizeVal.textContent = state.fontSize + "px";
    rotateVal.textContent = state.rotate + "°";
  }

  function handleInput() {
    syncStateFromInputs();
    scheduleRender();
  }

  function simulateTamper() {
    var rollback = Math.random();

    if (rollback < 0.34) {
      layer.style.backgroundImage = "none";
    } else if (rollback < 0.67) {
      layer.style.cssText = "position:fixed;inset:0;z-index:50;background:rgba(255,0,0,.05);pointer-events:none;";
    } else if (layer.parentNode) {
      layer.parentNode.removeChild(layer);
    } else {
      layer.style.opacity = "0";
    }

    setStatus("is-healed", "水印防护：检测到篡改，自愈中…");
  }

  [textInput, userInput, opacityInput, fontSizeInput, rotateInput].forEach(function (input) {
    input.addEventListener("input", handleInput);
  });

  tamperBtn.addEventListener("click", simulateTamper);

  layerObserver.observe(layer, {
    attributes: true,
    attributeFilter: ["style", "class", "id"]
  });

  bodyObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  syncStateFromInputs();
  render();
}());
