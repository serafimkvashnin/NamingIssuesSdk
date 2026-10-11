export declare const PROTOCOL_VERSION = 1;
/** Параметр в адресе iframe: по нему игра понимает, что запущена внутри хаба */
export declare const HOST_QUERY_PARAM = "niHost";
export interface Insets {
    top: number;
    bottom: number;
    left: number;
    right: number;
}
export interface SafeAreas {
    /** Системные зоны: вырез, панель жестов */
    safe: Insets;
    /** Зоны, занятые кнопками Telegram в полноэкранном режиме */
    content: Insets;
}
export interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    photo_url?: string;
}
export interface Session {
    /** hub — игра открыта в хабе; standalone — напрямую как Mini App */
    mode: 'hub' | 'standalone';
    /** Подписанная строка Telegram: сервер игры проверяет её токеном бота или по signature */
    initData: string;
    user?: TelegramUser;
    /** Язык Telegram-клиента игрока, например 'ru' */
    language: string;
    /** Параметр запуска игры (часть startapp, относящаяся к этой игре) */
    startParam?: string;
    /** Версия Bot API клиента, например '8.0' */
    version: string;
    platform: string;
    safeAreas: SafeAreas;
}
export type HapticCall = {
    kind: 'impact';
    style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
} | {
    kind: 'notification';
    type: 'error' | 'success' | 'warning';
} | {
    kind: 'selection';
};
export interface InviteOptions {
    /** Параметр запуска для приглашённого, например код комнаты; без него — просто ссылка на игру */
    startParam?: string;
    /** Строка под подписью карточки на языке игрока, например «Заходи ко мне в комнату K7MPQ» */
    text?: string;
}
export interface Colors {
    header?: string;
    background?: string;
    bottomBar?: string;
}
/** Методы, которые игра вызывает у хаба */
export interface HostMethods {
    init(protocol: number): Session;
    ready(): void;
    exit(): void;
    /** true — кнопку «Назад» обрабатывает игра; false — хаб закрывает игру */
    setBackHandler(enabled: boolean): void;
    setColors(colors: Colors): void;
    haptic(call: HapticCall): void;
    openLink(url: string): void;
    openTelegramLink(url: string): void;
    /** Окно «Поделиться» для сообщения, подготовленного ботом. true — отправлено */
    shareMessage(preparedMessageId: string): boolean;
    /** Карточка-приглашение в игру: её готовит бот, игроку открывается окно «Поделиться». true — отправлено */
    shareInvite(options: InviteOptions): boolean;
}
/** События, которые хаб присылает игре */
export interface GameEvents {
    back: void;
    safeAreas: SafeAreas;
}
export type Message = {
    __ni: 1;
    type: 'call';
    id: number;
    method: keyof HostMethods;
    args: unknown[];
} | {
    __ni: 1;
    type: 'result';
    id: number;
    result?: unknown;
    error?: string;
} | {
    __ni: 1;
    type: 'event';
    name: keyof GameEvents;
    data?: unknown;
};
export declare function isMessage(data: unknown): data is Message;
/** Сравнение версий Bot API: '8.0' >= '7.10' */
export declare function versionAtLeast(version: string, required: string): boolean;
