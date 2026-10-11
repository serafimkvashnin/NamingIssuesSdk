import type { Insets, TelegramUser } from './protocol';
interface EventHandlers {
    safeAreaChanged: () => void;
    contentSafeAreaChanged: () => void;
    backButtonClicked: () => void;
}
export interface TelegramWebApp {
    initData: string;
    initDataUnsafe: {
        user?: TelegramUser;
        start_param?: string;
    };
    version: string;
    platform: string;
    safeAreaInset?: Insets;
    contentSafeAreaInset?: Insets;
    ready(): void;
    expand(): void;
    close(): void;
    setHeaderColor(color: string): void;
    setBackgroundColor(color: string): void;
    setBottomBarColor?(color: string): void;
    openLink(url: string): void;
    openTelegramLink(url: string): void;
    shareMessage?(id: string, callback?: (sent: boolean) => void): void;
    isVersionAtLeast(version: string): boolean;
    onEvent<K extends keyof EventHandlers>(event: K, handler: EventHandlers[K]): void;
    offEvent<K extends keyof EventHandlers>(event: K, handler: EventHandlers[K]): void;
    BackButton: {
        show(): void;
        hide(): void;
        onClick(cb: () => void): void;
        offClick(cb: () => void): void;
    };
    HapticFeedback: {
        impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
        notificationOccurred(type: 'error' | 'success' | 'warning'): void;
        selectionChanged(): void;
    };
}
export declare function getTelegram(): TelegramWebApp | undefined;
/** Telegram.WebApp; если игра не подключила скрипт сама — подгружаем его */
export declare function loadTelegram(): Promise<TelegramWebApp | undefined>;
export {};
