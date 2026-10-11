import {
  PROTOCOL_VERSION,
  getTelegram,
  isMessage
} from "./chunk-O7ES7TMT.js";

// src/host.ts
var ZERO = { top: 0, bottom: 0, left: 0, right: 0 };
function safeAreasOf(tg) {
  var _a, _b;
  return { safe: (_a = tg == null ? void 0 : tg.safeAreaInset) != null ? _a : ZERO, content: (_b = tg == null ? void 0 : tg.contentSafeAreaInset) != null ? _b : ZERO };
}
function createHost({ iframe, startParam, onReady, onExit, getToken, shareInvite }) {
  const tg = getTelegram();
  const origin = new URL(iframe.src, location.href).origin;
  let gameHandlesBack = false;
  const post = (m) => {
    var _a;
    return (_a = iframe.contentWindow) == null ? void 0 : _a.postMessage(m, origin);
  };
  const emit = (name, data) => post({ __ni: 1, type: "event", name, data });
  const methods = {
    async init(protocol) {
      var _a, _b, _c, _d, _e, _f;
      if (protocol > PROTOCOL_VERSION) console.warn(`[NI host] game speaks protocol ${protocol}, host ${PROTOCOL_VERSION}`);
      const user = (_a = tg == null ? void 0 : tg.initDataUnsafe) == null ? void 0 : _a.user;
      const session = {
        mode: "hub",
        // initData хаба игре не отдаём: с ней можно действовать в хабе от имени игрока
        token: getToken ? await getToken() : void 0,
        initData: "",
        user,
        language: (_d = (_c = user == null ? void 0 : user.language_code) != null ? _c : (_b = navigator.language) == null ? void 0 : _b.slice(0, 2)) != null ? _d : "en",
        startParam,
        version: (_e = tg == null ? void 0 : tg.version) != null ? _e : "6.0",
        platform: (_f = tg == null ? void 0 : tg.platform) != null ? _f : "unknown",
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
    },
    shareInvite(options) {
      return shareInvite ? shareInvite(options) : false;
    },
    async getToken() {
      return getToken ? await getToken() : "";
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
