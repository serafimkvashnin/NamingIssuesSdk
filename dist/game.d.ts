/**
 * SDK для игр Naming Issues. Один и тот же код работает в двух режимах:
 *  - hub: игра открыта в iframe внутри хаба — все вызовы Telegram идут через хаб (postMessage);
 *  - standalone: игра открыта напрямую как Mini App — SDK вызывает Telegram.WebApp сам.
 *
 * Игра никогда не обращается к Telegram.WebApp напрямую — только через функции этого модуля.
 *
 * @example
 * import * as NI from '@naming-issues/sdk'
 *
 * const session = await NI.init()          // до первых запросов к серверу игры
 * connectToServer(await NI.getToken())     // кто играет — по пропуску, подписанному хабом
 * render(session.language)
 * NI.ready()
 *
 * @module
 */
import { type Colors, type InviteOptions, type Session } from './protocol';
type Handler = () => void;
/**
 * Запущена ли игра внутри хаба: она в iframe, и в адресе есть параметр niHost, который добавляет хаб.
 * Решение принимается до init(), по адресу страницы.
 */
export declare function isInHub(): boolean;
/**
 * Подключение к хабу или к Telegram. Вызывать один раз при старте, до первых запросов к серверу игры;
 * повторные вызовы возвращают тот же результат.
 *
 * В хабе: сессия с пропуском игрока (`token`), языком, параметром запуска и безопасными зонами;
 * если хаб не ответил за 5 секунд — ошибка. Вне хаба (обычный браузер или Telegram напрямую) работает
 * без хаба: пропуска нет, `initData` — от Telegram (или пустая в браузере).
 *
 * @example
 * const session = await NI.init()
 * if (session.startParam) joinRoom(session.startParam) // t.me/<бот>?startapp=<игра>__<параметр>
 */
export declare function init(): Promise<Session>;
/** Текущая сессия; до завершения init() — undefined */
export declare function getSession(): Session | undefined;
/**
 * Игра готова. Вне хаба сообщает об этом Telegram (`Telegram.WebApp.ready`).
 * В хабе экран загрузки закрывается сам, когда загрузилась страница игры, — вызов безвреден.
 */
export declare function ready(): void;
/** Выйти из игры: в хабе — вернуться в каталог, иначе закрыть Mini App */
export declare function exit(): void;
/**
 * Своя обработка кнопки «Назад» (например, выход из комнаты в меню игры).
 * null — по «Назад» хаб закрывает игру; в standalone кнопка скрывается.
 *
 * @example
 * NI.onBack(() => leaveRoom())   // в комнате: «Назад» — в меню игры
 * NI.onBack(null)                // в меню: «Назад» — выход в каталог хаба
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
/**
 * Пригласить в игру: хаб готовит карточку (превью, название, описание игры, строка `text`
 * и кнопка со ссылкой на игру с `startParam`), игроку открывается окно выбора чата.
 * Работает только в хабе на клиентах Telegram с Bot API 8.0+; true — сообщение отправлено,
 * false — игрок закрыл окно или приглашения недоступны.
 *
 * @example
 * if (NI.supports('8.0')) await NI.shareInvite({ startParam: room.code, text: `Заходи ко мне в комнату ${room.code} 🎮` })
 */
export declare function shareInvite(options?: InviteOptions): Promise<boolean>;
/**
 * Свежий пропуск игрока для сервера игры (JWT ES256 от хаба, живёт 24 часа). Брать его при каждом
 * подключении к серверу — тогда истечение срока посреди игры ничего не ломает. Вне хаба — пустая строка.
 * Как проверять пропуск на сервере — в README, раздел «Проверка игрока на сервере».
 *
 * @example
 * new signalR.HubConnectionBuilder()
 *   .withUrl(`${SERVER}/hubs/game`, { accessTokenFactory: () => NI.getToken() })
 *   .withAutomaticReconnect()
 *   .build()
 */
export declare function getToken(): Promise<string>;
/** Поддерживает ли клиент Telegram нужную версию Bot API, например supports('8.0') */
export declare function supports(version: string): boolean;
export {};
