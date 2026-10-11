import {
  HOST_QUERY_PARAM,
  PROTOCOL_VERSION,
  getTelegram,
  isMessage,
  loadTelegram,
  versionAtLeast
} from "./chunk-GY2NU2NZ.js";

// src/game.ts
var session;
var initPromise;
var backHandler = null;
var tg;
var pending = /* @__PURE__ */ new Map();
var nextId = 1;
function call(method, ...args) {
  const id = nextId++;
  const message = { __ni: 1, type: "call", id, method, args };
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    window.parent.postMessage(message, "*");
  });
}
function onHostMessage(e) {
  if (e.source !== window.parent || !isMessage(e.data)) return;
  const m = e.data;
  if (m.type === "result") {
    const p = pending.get(m.id);
    if (!p) return;
    pending.delete(m.id);
    if (m.error) p.reject(new Error(m.error));
    else p.resolve(m.result);
  } else if (m.type === "event") {
    handleEvent(m.name, m.data);
  }
}
function handleEvent(name, data) {
  if (name === "back") backHandler == null ? void 0 : backHandler();
  if (name === "safeAreas") applySafeAreas(data);
}
function applySafeAreas(areas) {
  const style = document.documentElement.style;
  for (const side of ["top", "bottom", "left", "right"]) {
    style.setProperty(`--tg-safe-area-inset-${side}`, `${areas.safe[side]}px`);
    style.setProperty(`--tg-content-safe-area-inset-${side}`, `${areas.content[side]}px`);
  }
}
function isInHub() {
  try {
    return window.parent !== window && new URLSearchParams(location.search).has(HOST_QUERY_PARAM);
  } catch {
    return false;
  }
}
function standaloneSession(app) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
  const user = (_a = app.initDataUnsafe) == null ? void 0 : _a.user;
  const zero = { top: 0, bottom: 0, left: 0, right: 0 };
  return {
    mode: "standalone",
    initData: (_b = app.initData) != null ? _b : "",
    user,
    language: (_e = (_d = user == null ? void 0 : user.language_code) != null ? _d : (_c = navigator.language) == null ? void 0 : _c.slice(0, 2)) != null ? _e : "en",
    startParam: (_f = app.initDataUnsafe) == null ? void 0 : _f.start_param,
    version: (_g = app.version) != null ? _g : "6.0",
    platform: (_h = app.platform) != null ? _h : "unknown",
    safeAreas: { safe: (_i = app.safeAreaInset) != null ? _i : zero, content: (_j = app.contentSafeAreaInset) != null ? _j : zero }
  };
}
function init() {
  initPromise != null ? initPromise : initPromise = (async () => {
    var _a;
    if (isInHub()) {
      window.addEventListener("message", onHostMessage);
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Hub did not answer")), 5e3));
      session = await Promise.race([call("init", PROTOCOL_VERSION), timeout]);
      applySafeAreas(session.safeAreas);
    } else {
      tg = await loadTelegram();
      (_a = tg == null ? void 0 : tg.expand) == null ? void 0 : _a.call(tg);
      session = tg ? standaloneSession(tg) : standaloneSession({});
    }
    return session;
  })();
  return initPromise;
}
function getSession() {
  return session;
}
function ready() {
  var _a;
  if ((session == null ? void 0 : session.mode) === "hub") void call("ready");
  else (_a = tg != null ? tg : getTelegram()) == null ? void 0 : _a.ready();
}
function exit() {
  if ((session == null ? void 0 : session.mode) === "hub") void call("exit");
  else tg == null ? void 0 : tg.close();
}
function onBack(handler) {
  const previous = backHandler;
  backHandler = handler;
  if ((session == null ? void 0 : session.mode) === "hub") {
    if (!!previous !== !!handler) void call("setBackHandler", !!handler);
    return;
  }
  const button = tg == null ? void 0 : tg.BackButton;
  if (!button) return;
  if (previous) button.offClick(previous);
  if (handler) {
    button.onClick(handler);
    button.show();
  } else button.hide();
}
function setColors(colors) {
  var _a;
  if ((session == null ? void 0 : session.mode) === "hub") {
    void call("setColors", colors);
    return;
  }
  try {
    if (colors.header) tg == null ? void 0 : tg.setHeaderColor(colors.header);
    if (colors.background) tg == null ? void 0 : tg.setBackgroundColor(colors.background);
    if (colors.bottomBar) (_a = tg == null ? void 0 : tg.setBottomBarColor) == null ? void 0 : _a.call(tg, colors.bottomBar);
  } catch {
  }
}
function sendHaptic(h) {
  if ((session == null ? void 0 : session.mode) === "hub") {
    void call("haptic", h);
    return;
  }
  const feedback = tg == null ? void 0 : tg.HapticFeedback;
  if (!feedback) return;
  if (h.kind === "impact") feedback.impactOccurred(h.style);
  else if (h.kind === "notification") feedback.notificationOccurred(h.type);
  else feedback.selectionChanged();
}
var haptic = {
  impact: (style = "light") => sendHaptic({ kind: "impact", style }),
  notification: (type) => sendHaptic({ kind: "notification", type }),
  selection: () => sendHaptic({ kind: "selection" })
};
function openLink(url) {
  if ((session == null ? void 0 : session.mode) === "hub") void call("openLink", url);
  else if (tg) tg.openLink(url);
  else window.open(url, "_blank");
}
function openTelegramLink(url) {
  if ((session == null ? void 0 : session.mode) === "hub") void call("openTelegramLink", url);
  else if (tg) tg.openTelegramLink(url);
  else window.open(url, "_blank");
}
function shareMessage(preparedMessageId) {
  if ((session == null ? void 0 : session.mode) === "hub") return call("shareMessage", preparedMessageId);
  return new Promise((resolve) => {
    if (!(tg == null ? void 0 : tg.shareMessage)) return resolve(false);
    tg.shareMessage(preparedMessageId, (sent) => resolve(!!sent));
  });
}
function shareInvite(options = {}) {
  if ((session == null ? void 0 : session.mode) !== "hub") return Promise.resolve(false);
  return call("shareInvite", options);
}
function supports(version) {
  return !!session && versionAtLeast(session.version, version);
}
export {
  exit,
  getSession,
  haptic,
  init,
  isInHub,
  onBack,
  openLink,
  openTelegramLink,
  ready,
  setColors,
  shareInvite,
  shareMessage,
  supports
};
//# sourceMappingURL=index.js.map
