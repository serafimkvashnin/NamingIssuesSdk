// Минимальное описание Telegram.WebApp — только то, чем пользуется SDK.
// Своё, чтобы игры не тянули @types/telegram-web-app ради SDK.

import type { Insets, TelegramUser } from './protocol'

interface EventHandlers {
  safeAreaChanged: () => void
  contentSafeAreaChanged: () => void
  backButtonClicked: () => void
}

export interface TelegramWebApp {
  initData: string
  initDataUnsafe: { user?: TelegramUser; start_param?: string }
  version: string
  platform: string
  safeAreaInset?: Insets
  contentSafeAreaInset?: Insets
  ready(): void
  expand(): void
  close(): void
  setHeaderColor(color: string): void
  setBackgroundColor(color: string): void
  setBottomBarColor?(color: string): void
  openLink(url: string): void
  openTelegramLink(url: string): void
  shareMessage?(id: string, callback?: (sent: boolean) => void): void
  isVersionAtLeast(version: string): boolean
  onEvent<K extends keyof EventHandlers>(event: K, handler: EventHandlers[K]): void
  offEvent<K extends keyof EventHandlers>(event: K, handler: EventHandlers[K]): void
  BackButton: { show(): void; hide(): void; onClick(cb: () => void): void; offClick(cb: () => void): void }
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
    notificationOccurred(type: 'error' | 'success' | 'warning'): void
    selectionChanged(): void
  }
}

// Без declare global: иначе конфликт с @types/telegram-web-app в проектах игр
const w = window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }

const SCRIPT_URL = 'https://telegram.org/js/telegram-web-app.js'

export function getTelegram(): TelegramWebApp | undefined {
  return w.Telegram?.WebApp
}

/** Telegram.WebApp; если игра не подключила скрипт сама — подгружаем его */
export function loadTelegram(): Promise<TelegramWebApp | undefined> {
  const existing = getTelegram()
  if (existing) return Promise.resolve(existing)
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.onload = () => resolve(getTelegram())
    script.onerror = () => resolve(undefined)
    document.head.appendChild(script)
  })
}
