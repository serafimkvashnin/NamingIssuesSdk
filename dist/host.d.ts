/**
 * Сторона хаба (`@naming-issues/sdk/host`): принимает вызовы игры из iframe и выполняет их
 * через Telegram.WebApp хаба. Сообщения принимаются только от этого iframe и с его домена.
 *
 * @module
 */
import { type InviteOptions } from './protocol';
export interface HostOptions {
    iframe: HTMLIFrameElement;
    /** Параметр запуска, предназначенный этой игре */
    startParam?: string;
    /** Игра вызвала ready() (необязательно: экран загрузки хаб может закрывать по загрузке iframe) */
    onReady?: () => void;
    /** Игра вызвала exit() или игрок нажал «Назад», а игра его не перехватывает */
    onExit?: () => void;
    /** Пропуск игрока для этой игры (JWT, подписанный хабом) — уходит игре вместо initData */
    getToken?: () => Promise<string>;
    /** Приглашение в игру (NI.shareInvite): хаб готовит карточку через бота и показывает «Поделиться» */
    shareInvite?: (options: InviteOptions) => Promise<boolean>;
}
export interface Host {
    /** Отключиться от игры: снять обработчики и спрятать кнопку «Назад» */
    destroy(): void;
}
/**
 * Подключить хост к iframe игры. Пока хост жив, кнопка «Назад» Telegram видна и ведёт либо в игру
 * (если она вызвала `NI.onBack`), либо в `onExit`; безопасные зоны пересылаются игре при изменении.
 * iframe должен уже иметь `src` (с параметром niHost) — по нему определяется домен игры.
 *
 * @example
 * const host = createHost({
 *   iframe,
 *   startParam,
 *   onExit: () => closeGame(),
 *   getToken: () => api.post('game-token', { gameId }).then((r) => r.token),
 *   shareInvite: (options) => prepareAndShare(gameId, options),
 * })
 * // при закрытии игры:
 * host.destroy()
 */
export declare function createHost({ iframe, startParam, onReady, onExit, getToken, shareInvite }: HostOptions): Host;
