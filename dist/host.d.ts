import { type InviteOptions } from './protocol';
export interface HostOptions {
    iframe: HTMLIFrameElement;
    /** Параметр запуска, предназначенный этой игре */
    startParam?: string;
    /** Игра вызвала ready() */
    onReady?: () => void;
    /** Игра вызвала exit() или игрок нажал «Назад», а игра его не перехватывает */
    onExit?: () => void;
    /** Приглашение в игру (NI.shareInvite): хаб готовит карточку через бота и показывает «Поделиться» */
    shareInvite?: (options: InviteOptions) => Promise<boolean>;
}
export interface Host {
    /** Отключиться от игры: снять обработчики и спрятать кнопку «Назад» */
    destroy(): void;
}
export declare function createHost({ iframe, startParam, onReady, onExit, shareInvite }: HostOptions): Host;
