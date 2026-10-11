import {
  PROTOCOL_VERSION,
  getTelegram,
  isMessage
} from "./chunk-DS6O3H5A.js";

// src/host.ts
var ZERO = { top: 0, bottom: 0, left: 0, right: 0 };
function safeAreasOf(tg) {
  var _a, _b;
  return { safe: (_a = tg == null ? void 0 : tg.safeAreaInset) != null ? _a : ZERO, content: (_b = tg == null ? void 0 : tg.contentSafeAreaInset) != null ? _b : ZERO };
}
function createHost({ iframe, startParam, onReady, onExit }) {
  const tg = getTelegram();
  const origin = new URL(iframe.src, location.href).origin;
  let gameHandlesBack = false;
  const post = (m) => {
    var _a;
    return (_a = iframe.contentWindow) == null ? void 0 : _a.postMessage(m, origin);
  };
  const emit = (name, data) => post({ __ni: 1, type: "event", name, data });
  const methods = {
    init(protocol) {
      var _a, _b, _c, _d, _e, _f, _g;
      if (protocol > PROTOCOL_VERSION) console.warn(`[NI host] game speaks protocol ${protocol}, host ${PROTOCOL_VERSION}`);
      const user = (_a = tg == null ? void 0 : tg.initDataUnsafe) == null ? void 0 : _a.user;
      const session = {
        mode: "hub",
        initData: (_b = tg == null ? void 0 : tg.initData) != null ? _b : "",
        user,
        language: (_e = (_d = user == null ? void 0 : user.language_code) != null ? _d : (_c = navigator.language) == null ? void 0 : _c.slice(0, 2)) != null ? _e : "en",
        startParam,
        version: (_f = tg == null ? void 0 : tg.version) != null ? _f : "6.0",
        platform: (_g = tg == null ? void 0 : tg.platform) != null ? _g : "unknown",
        safeAreas: safeAreasOf(tg)
      };
      return session;
    },
    ready() {
      onReady == null ? void 0 : onReady();
    },
    exit() {
      onExit == null ? void 0 : onExit();
    },
    setBackHandler(enabled) {
      gameHandlesBack = enabled;
    },
    setColors(colors) {
      var _a;
      try {
        if (colors.header) tg == null ? void 0 : tg.setHeaderColor(colors.header);
        if (colors.background) tg == null ? void 0 : tg.setBackgroundColor(colors.background);
        if (colors.bottomBar) (_a = tg == null ? void 0 : tg.setBottomBarColor) == null ? void 0 : _a.call(tg, colors.bottomBar);
      } catch {
      }
    },
    haptic(h) {
      const f = tg == null ? void 0 : tg.HapticFeedback;
      if (!f) return;
      if (h.kind === "impact") f.impactOccurred(h.style);
      else if (h.kind === "notification") f.notificationOccurred(h.type);
      else f.selectionChanged();
    },
    openLink(url) {
      if (tg) tg.openLink(url);
      else window.open(url, "_blank");
    },
    openTelegramLink(url) {
      if (tg) tg.openTelegramLink(url);
      else window.open(url, "_blank");
    },
    shareMessage(id) {
      return new Promise((resolve) => {
        if (!(tg == null ? void 0 : tg.shareMessage)) return resolve(false);
        tg.shareMessage(id, (sent) => resolve(!!sent));
      });
    }
  };
  async function onMessage(e) {
    if (e.source !== iframe.contentWindow || e.origin !== origin || !isMessage(e.data)) return;
    const m = e.data;
    if (m.type !== "call") return;
    const fn = methods[m.method];
    try {
      if (!fn) throw new Error(`Unknown method ${m.method}`);
      post({ __ni: 1, type: "result", id: m.id, result: await fn(...m.args) });
    } catch (err) {
      post({ __ni: 1, type: "result", id: m.id, error: err instanceof Error ? err.message : String(err) });
    }
  }
  const onBack = () => gameHandlesBack ? emit("back") : onExit == null ? void 0 : onExit();
  const onSafeAreas = () => emit("safeAreas", safeAreasOf(tg));
  window.addEventListener("message", onMessage);
  tg == null ? void 0 : tg.BackButton.onClick(onBack);
  tg == null ? void 0 : tg.BackButton.show();
  tg == null ? void 0 : tg.onEvent("safeAreaChanged", onSafeAreas);
  tg == null ? void 0 : tg.onEvent("contentSafeAreaChanged", onSafeAreas);
  return {
    destroy() {
      window.removeEventListener("message", onMessage);
      tg == null ? void 0 : tg.BackButton.offClick(onBack);
      tg == null ? void 0 : tg.BackButton.hide();
      tg == null ? void 0 : tg.offEvent("safeAreaChanged", onSafeAreas);
      tg == null ? void 0 : tg.offEvent("contentSafeAreaChanged", onSafeAreas);
    }
  };
}
export {
  createHost
};
//# sourceMappingURL=host.js.map
