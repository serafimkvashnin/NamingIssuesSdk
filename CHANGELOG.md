# Changelog

Версии по [semver](https://semver.org/lang/ru/): до 1.0.0 новая функциональность поднимает minor (0.x.0), исправления — patch (0.x.y). Игры ставят SDK по тегу: `.../archive/refs/tags/vX.Y.Z.tar.gz`.

## 0.4.0

- `NI.getToken()`: свежий пропуск игрока для каждого подключения к серверу игры.
- Протокол: метод `getToken` у хоста.

## 0.3.0

- В хабе игра получает `session.token` — пропуск игрока (JWT ES256), подписанный хабом. `session.initData` в хабе теперь пустая: initData хаба играм не передаётся.
- `createHost({ getToken })`: хаб выдаёт пропуск для игры.

## 0.2.0

- `NI.shareInvite({ startParam, text })`: карточка-приглашение в игру, которую готовит хаб.
- `createHost({ shareInvite })`.

## 0.1.0

- Первая версия: `init`, `ready`, `exit`, `onBack`, `setColors`, `haptic`, `openLink`, `openTelegramLink`, `shareMessage`, `supports`; безопасные зоны через CSS-переменные; хост для хаба (`@naming-issues/sdk/host`).
