// Сторона хаба: принимает вызовы игры из iframe и выполняет их через Telegram.WebApp.

import { PROTOCOL_VERSION, isMessage, type GameEvents, type HostMethods, type InviteOptions, type Message, type SafeAreas, type Session } from './protocol'
import { getTelegram, type TelegramWebApp } from './telegram'

export interface HostOptions {
  iframe: HTMLIFrameElement
  /** Параметр запуска, предназначенный этой игре */
  startParam?: string
  /** Игра вызвала ready() */
  onReady?: () => void
  /** Игра вызвала exit() или игрок нажал «Назад», а игра его не перехватывает */
  onExit?: () => void
  /** Пропуск игрока для этой игры (JWT, подписанный хабом) — уходит игре вместо initData */
  getToken?: () => Promise<string>
  /** Приглашение в игру (NI.shareInvite): хаб готовит карточку через бота и показывает «Поделиться» */
  shareInvite?: (options: InviteOptions) => Promise<boolean>
}

export interface Host {
  /** Отключиться от игры: снять обработчики и спрятать кнопку «Назад» */
  destroy(): void
}

const ZERO = { top: 0, bottom: 0, left: 0, right: 0 }

function safeAreasOf(tg: TelegramWebApp | undefined): SafeAreas {
  return { safe: tg?.safeAreaInset ?? ZERO, content: tg?.contentSafeAreaInset ?? ZERO }
}

export function createHost({ iframe, startParam, onReady, onExit, getToken, shareInvite }: HostOptions): Host {
  const tg = getTelegram()
  const origin = new URL(iframe.src, location.href).origin
  let gameHandlesBack = false

  const post = (m: Message) => iframe.contentWindow?.postMessage(m, origin)
  const emit = <K extends keyof GameEvents>(name: K, data?: GameEvents[K]) => post({ __ni: 1, type: 'event', name, data })

  const methods: { [K in keyof HostMethods]: (...args: Parameters<HostMethods[K]>) => ReturnType<HostMethods[K]> | Promise<ReturnType<HostMethods[K]>> } = {
    async init(protocol) {
      if (protocol > PROTOCOL_VERSION) console.warn(`[NI host] game speaks protocol ${protocol}, host ${PROTOCOL_VERSION}`)
      const user = tg?.initDataUnsafe?.user
      const session: Session = {
        mode: 'hub',
        // initData хаба игре не отдаём: с ней можно действовать в хабе от имени игрока
        token: getToken ? await getToken() : undefined,
        initData: '',
        user,
        language: user?.language_code ?? navigator.language?.slice(0, 2) ?? 'en',
        startParam,
        version: tg?.version ?? '6.0',
        platform: tg?.platform ?? 'unknown',
        safeAreas: safeAreasOf(tg),
      }
      return session
    },
    ready() {
      onReady?.()
    },
    exit() {
      onExit?.()
    },
    setBackHandler(enabled) {
      gameHandlesBack = enabled
    },
    setColors(colors) {
      try {
        if (colors.header) tg?.setHeaderColor(colors.header)
        if (colors.background) tg?.setBackgroundColor(colors.background)
        if (colors.bottomBar) tg?.setBottomBarColor?.(colors.bottomBar)
      } catch {
        // старые клиенты не знают части методов
      }
    },
    haptic(h) {
      const f = tg?.HapticFeedback
      if (!f) return
      if (h.kind === 'impact') f.impactOccurred(h.style)
      else if (h.kind === 'notification') f.notificationOccurred(h.type)
      else f.selectionChanged()
    },
    openLink(url) {
      if (tg) tg.openLink(url)
      else window.open(url, '_blank')
    },
    openTelegramLink(url) {
      if (tg) tg.openTelegramLink(url)
      else window.open(url, '_blank')
    },
    shareMessage(id) {
      return new Promise<boolean>((resolve) => {
        if (!tg?.shareMessage) return resolve(false)
        tg.shareMessage(id, (sent) => resolve(!!sent))
      })
    },
    shareInvite(options) {
      return shareInvite ? shareInvite(options) : false
    },
  }

  async function onMessage(e: MessageEvent) {
    if (e.source !== iframe.contentWindow || e.origin !== origin || !isMessage(e.data)) return
    const m = e.data
    if (m.type !== 'call') return
    const fn = methods[m.method] as ((...a: unknown[]) => unknown) | undefined
    try {
      if (!fn) throw new Error(`Unknown method ${m.method}`)
      post({ __ni: 1, type: 'result', id: m.id, result: await fn(...m.args) })
    } catch (err) {
      post({ __ni: 1, type: 'result', id: m.id, error: err instanceof Error ? err.message : String(err) })
    }
  }

  const onBack = () => (gameHandlesBack ? emit('back') : onExit?.())
  const onSafeAreas = () => emit('safeAreas', safeAreasOf(tg))

  window.addEventListener('message', onMessage)
  tg?.BackButton.onClick(onBack)
  tg?.BackButton.show()
  tg?.onEvent('safeAreaChanged', onSafeAreas)
  tg?.onEvent('contentSafeAreaChanged', onSafeAreas)

  return {
    destroy() {
      window.removeEventListener('message', onMessage)
      tg?.BackButton.offClick(onBack)
      tg?.BackButton.hide()
      tg?.offEvent('safeAreaChanged', onSafeAreas)
      tg?.offEvent('contentSafeAreaChanged', onSafeAreas)
    },
  }
}
