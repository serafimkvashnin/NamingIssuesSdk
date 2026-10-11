// SDK для игр. Один и тот же код работает в двух режимах:
//  - hub: игра открыта в iframe внутри хаба — все вызовы Telegram идут через хаб (postMessage);
//  - standalone: игра открыта напрямую как Mini App — SDK вызывает Telegram.WebApp сам.

import {
  HOST_QUERY_PARAM, PROTOCOL_VERSION, isMessage, versionAtLeast,
  type Colors, type GameEvents, type HapticCall, type HostMethods, type Message, type SafeAreas, type Session,
} from './protocol'
import { getTelegram, loadTelegram, type TelegramWebApp } from './telegram'

type Handler = () => void

let session: Session | undefined
let initPromise: Promise<Session> | undefined
let backHandler: Handler | null = null
let tg: TelegramWebApp | undefined

// ---------- Мост к хабу ----------

const pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>()
let nextId = 1

function call<M extends keyof HostMethods>(method: M, ...args: Parameters<HostMethods[M]>): Promise<ReturnType<HostMethods[M]>> {
  const id = nextId++
  const message: Message = { __ni: 1, type: 'call', id, method, args }
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve: resolve as (v: unknown) => void, reject })
    window.parent.postMessage(message, '*')
  })
}

function onHostMessage(e: MessageEvent) {
  if (e.source !== window.parent || !isMessage(e.data)) return
  const m = e.data
  if (m.type === 'result') {
    const p = pending.get(m.id)
    if (!p) return
    pending.delete(m.id)
    if (m.error) p.reject(new Error(m.error))
    else p.resolve(m.result)
  } else if (m.type === 'event') {
    handleEvent(m.name, m.data)
  }
}

function handleEvent<K extends keyof GameEvents>(name: K, data: unknown) {
  if (name === 'back') backHandler?.()
  if (name === 'safeAreas') applySafeAreas(data as SafeAreas)
}

/** Те же CSS-переменные, что выставляет Telegram, — вёрстка игры не зависит от режима */
function applySafeAreas(areas: SafeAreas) {
  const style = document.documentElement.style
  for (const side of ['top', 'bottom', 'left', 'right'] as const) {
    style.setProperty(`--tg-safe-area-inset-${side}`, `${areas.safe[side]}px`)
    style.setProperty(`--tg-content-safe-area-inset-${side}`, `${areas.content[side]}px`)
  }
}

export function isInHub(): boolean {
  try {
    return window.parent !== window && new URLSearchParams(location.search).has(HOST_QUERY_PARAM)
  } catch {
    return false
  }
}

// ---------- Standalone ----------

function standaloneSession(app: TelegramWebApp): Session {
  const user = app.initDataUnsafe?.user
  const zero = { top: 0, bottom: 0, left: 0, right: 0 }
  return {
    mode: 'standalone',
    initData: app.initData ?? '',
    user,
    language: user?.language_code ?? navigator.language?.slice(0, 2) ?? 'en',
    startParam: app.initDataUnsafe?.start_param,
    version: app.version ?? '6.0',
    platform: app.platform ?? 'unknown',
    safeAreas: { safe: app.safeAreaInset ?? zero, content: app.contentSafeAreaInset ?? zero },
  }
}

// ---------- Публичный API ----------

/**
 * Подключение к хабу или к Telegram. Вызывать один раз при старте, до первых запросов к серверу игры.
 * Вне Telegram (обычный браузер) тоже работает: initData будет пустой.
 */
export function init(): Promise<Session> {
  initPromise ??= (async () => {
    if (isInHub()) {
      window.addEventListener('message', onHostMessage)
      const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Hub did not answer')), 5000))
      session = await Promise.race([call('init', PROTOCOL_VERSION), timeout])
      applySafeAreas(session.safeAreas)
    } else {
      tg = await loadTelegram()
      tg?.expand?.()
      session = tg ? standaloneSession(tg) : standaloneSession({} as TelegramWebApp)
    }
    return session
  })()
  return initPromise
}

/** Текущая сессия; до завершения init() — undefined */
export function getSession(): Session | undefined {
  return session
}

/** Игра загрузилась и готова — хаб убирает экран загрузки */
export function ready(): void {
  if (session?.mode === 'hub') void call('ready')
  else (tg ?? getTelegram())?.ready()
}

/** Выйти из игры: в хабе — вернуться в каталог, иначе закрыть Mini App */
export function exit(): void {
  if (session?.mode === 'hub') void call('exit')
  else tg?.close()
}

/**
 * Своя обработка кнопки «Назад» (например, выход из комнаты в меню игры).
 * null — по «Назад» хаб закрывает игру; в standalone кнопка скрывается.
 */
export function onBack(handler: Handler | null): void {
  const previous = backHandler
  backHandler = handler
  if (session?.mode === 'hub') {
    if (!!previous !== !!handler) void call('setBackHandler', !!handler)
    return
  }
  const button = tg?.BackButton
  if (!button) return
  if (previous) button.offClick(previous)
  if (handler) {
    button.onClick(handler)
    button.show()
  } else button.hide()
}

/** Цвет шапки и фона Telegram */
export function setColors(colors: Colors): void {
  if (session?.mode === 'hub') {
    void call('setColors', colors)
    return
  }
  try {
    if (colors.header) tg?.setHeaderColor(colors.header)
    if (colors.background) tg?.setBackgroundColor(colors.background)
    if (colors.bottomBar) tg?.setBottomBarColor?.(colors.bottomBar)
  } catch {
    // старые клиенты не знают части методов
  }
}

function sendHaptic(h: HapticCall) {
  if (session?.mode === 'hub') {
    void call('haptic', h)
    return
  }
  const feedback = tg?.HapticFeedback
  if (!feedback) return
  if (h.kind === 'impact') feedback.impactOccurred(h.style)
  else if (h.kind === 'notification') feedback.notificationOccurred(h.type)
  else feedback.selectionChanged()
}

/** Вибрация; вне Telegram ничего не делает */
export const haptic = {
  impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') => sendHaptic({ kind: 'impact', style }),
  notification: (type: 'error' | 'success' | 'warning') => sendHaptic({ kind: 'notification', type }),
  selection: () => sendHaptic({ kind: 'selection' }),
}

/** Внешняя ссылка в браузере */
export function openLink(url: string): void {
  if (session?.mode === 'hub') void call('openLink', url)
  else if (tg) tg.openLink(url)
  else window.open(url, '_blank')
}

/** Ссылка t.me/... — чат, канал, бот, шаринг */
export function openTelegramLink(url: string): void {
  if (session?.mode === 'hub') void call('openTelegramLink', url)
  else if (tg) tg.openTelegramLink(url)
  else window.open(url, '_blank')
}

/** Окно «Поделиться» для сообщения, подготовленного ботом (Bot API 8.0+). true — отправлено */
export function shareMessage(preparedMessageId: string): Promise<boolean> {
  if (session?.mode === 'hub') return call('shareMessage', preparedMessageId)
  return new Promise((resolve) => {
    if (!tg?.shareMessage) return resolve(false)
    tg.shareMessage(preparedMessageId, (sent) => resolve(!!sent))
  })
}

/** Поддерживает ли клиент Telegram нужную версию Bot API, например supports('8.0') */
export function supports(version: string): boolean {
  return !!session && versionAtLeast(session.version, version)
}
