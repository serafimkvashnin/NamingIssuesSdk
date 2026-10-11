// src/protocol.ts
var PROTOCOL_VERSION = 1;
var HOST_QUERY_PARAM = "niHost";
function isMessage(data) {
  return typeof data === "object" && data !== null && data.__ni === 1;
}
function versionAtLeast(version, required) {
  var _a, _b;
  const a = version.split(".").map(Number);
  const b = required.split(".").map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = (_a = a[i]) != null ? _a : 0, y = (_b = b[i]) != null ? _b : 0;
    if (x !== y) return x > y;
  }
  return true;
}

// src/telegram.ts
var w = window;
var SCRIPT_URL = "https://telegram.org/js/telegram-web-app.js";
function getTelegram() {
  var _a;
  return (_a = w.Telegram) == null ? void 0 : _a.WebApp;
}
function loadTelegram() {
  const existing = getTelegram();
  if (existing) return Promise.resolve(existing);
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.onload = () => resolve(getTelegram());
    script.onerror = () => resolve(void 0);
    document.head.appendChild(script);
  });
}

export {
  PROTOCOL_VERSION,
  HOST_QUERY_PARAM,
  isMessage,
  versionAtLeast,
  getTelegram,
  loadTelegram
};
//# sourceMappingURL=chunk-O7ES7TMT.js.map
