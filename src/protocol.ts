// Протокол между игрой (в iframe) и хабом. Сообщения ходят через postMessage
// и помечены полем __ni, чтобы не путать их с чужими (например, telegram-web-app.js).

export const PROTOCOL_VERSION = 1

/** Параметр в адресе iframe: по нему игра понимает, что запущена внутри хаба */
export const HOST_QUERY_PARAM = 'niHost'

export interface Insets {
  top: number
  bottom: number
  left: number
  right: number
}

export interface SafeAreas {
  /** Системные зоны: вырез, панель жестов */
  safe: Insets
  /** Зоны, занятые кнопками Telegram в полноэкранном режиме */
  content: Insets
}

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
  photo_url?: string
}

export interface Session {
  /** hub — игра открыта в хабе; standalone — напрямую как Mini App */
  mode: 'hub' | 'standalone'
  /** Подписанная строка Telegram: сервер игры проверяет её токеном бота или по signature */
  initData: string
  user?: TelegramUser
  /** Язык Telegram-клиента игрока, например 'ru' */
  language: string
  /** Параметр запуска игры (часть startapp, относящаяся к этой игре) */
  startParam?: string
  /** Версия Bot API клиента, например '8.0' */
  version: string
  platform: string
  safeAreas: SafeAreas
}

export type HapticCall =
  | { kind: 'impact'; style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' }
  | { kind: 'notification'; type: 'error' | 'success' | 'warning' }
  | { kind: 'selection' }

export interface Colors {
  header?: string
  background?: string
  bottomBar?: string
}

/** Методы, которые игра вызывает у хаба */
export interface HostMethods {
  init(protocol: number): Session
  ready(): void
  exit(): void
  /** true — кнопку «Назад» обрабатывает игра; false — хаб закрывает игру */
  setBackHandler(enabled: boolean): void
  setColors(colors: Colors): void
  haptic(call: HapticCall): void
  openLink(url: string): void
  openTelegramLink(url: string): void
  /** Окно «Поделиться» для сообщения, подготовленного ботом. true — отправлено */
  shareMessage(preparedMessageId: string): boolean
}

/** События, которые хаб присылает игре */
export interface GameEvents {
  back: void
  safeAreas: SafeAreas
}

export type Message =
  | { __ni: 1; type: 'call'; id: number; method: keyof HostMethods; args: unknown[] }
  | { __ni: 1; type: 'result'; id: number; result?: unknown; error?: string }
  | { __ni: 1; type: 'event'; name: keyof GameEvents; data?: unknown }

export function isMessage(data: unknown): data is Message {
  return typeof data === 'object' && data !== null && (data as { __ni?: unknown }).__ni === 1
}

/** Сравнение версий Bot API: '8.0' >= '7.10' */
export function versionAtLeast(version: string, required: string): boolean {
  const a = version.split('.').map(Number)
  const b = required.split('.').map(Number)
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] ?? 0, y = b[i] ?? 0
    if (x !== y) return x > y
  }
  return true
}
