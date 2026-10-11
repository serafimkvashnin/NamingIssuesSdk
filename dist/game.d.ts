import { type Colors, type Session } from './protocol';
type Handler = () => void;
export declare function isInHub(): boolean;
/**
 * Подключение к хабу или к Telegram. Вызывать один раз при старте, до первых запросов к серверу игры.
 * Вне Telegram (обычный браузер) тоже работает: initData будет пустой.
 */
export declare function init(): Promise<Session>;
/** Текущая сессия; до завершения init() — undefined */
export declare function getSession(): Session | undefined;
/** Игра загрузилась и готова — хаб убирает экран загрузки */
export declare function ready(): void;
/** Выйти из игры: в хабе — вернуться в каталог, иначе закрыть Mini App */
export declare function exit(): void;
/**
 * Своя обработка кнопки «Назад» (например, выход из комнаты в меню игры).
 * null — по «Назад» хаб закрывает игру; в standalone кнопка скрывается.
 */
export declare function onBack(handler: Handler | null): void;
/** Цвет шапки и фона Telegram */
export declare function setColors(colors: Colors): void;
/** Вибрация; вне Telegram ничего не делает */
export declare const haptic: {
    impact: (style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notification: (type: 'error' | 'success' | 'warning') => void;
    selection: () => void;
};
/** Внешняя ссылка в браузере */
export declare function openLink(url: string): void;
/** Ссылка t.me/... — чат, канал, бот, шаринг */
export declare function openTelegramLink(url: string): void;
/** Окно «Поделиться» для сообщения, подготовленного ботом (Bot API 8.0+). true — отправлено */
export declare function shareMessage(preparedMessageId: string): Promise<boolean>;
/** Поддерживает ли клиент Telegram нужную версию Bot API, например supports('8.0') */
export declare function supports(version: string): boolean;
export {};
