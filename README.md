# Naming Issues SDK

SDK для игр Naming Issues. С ним одна и та же сборка игры работает в двух режимах:

- **в хабе.** Игра открыта в iframe внутри главной Mini App бота (каталога игр). Все вызовы Telegram (кнопка «Назад», вибрация, ссылки, «Поделиться») выполняет хаб по запросу игры;
- **сама по себе.** Игра открыта напрямую, например по ссылке `t.me/NamingIssuesBot/<игра>`. Тогда SDK вызывает `Telegram.WebApp` сам.

Игре не нужно знать, в каком режиме она запущена. Напрямую к `Telegram.WebApp` обращаться нельзя, всё идёт через SDK.

## Подключение

npm (React, Phaser с бандлером):

```
npm install https://github.com/serafimkvashnin/NamingIssuesSdk/archive/refs/tags/v0.1.0.tar.gz
```

```ts
import * as NI from '@naming-issues/sdk'

const session = await NI.init()   // до первых запросов к серверу игры
// session.initData — передать серверу игры для проверки игрока
// session.language, session.user, session.startParam
render()
NI.ready()                        // игра готова, хаб убирает экран загрузки
```

Без бандлера (Unity WebGL, обычный HTML): подключи `dist/ni-sdk.js`, и всё API появится в `window.NI`.

## API

| Метод | Что делает |
|---|---|
| `init(): Promise<Session>` | подключается к хабу или к Telegram; вызывается один раз |
| `getSession()` | текущая сессия (после `init`) |
| `ready()` | игра загрузилась |
| `exit()` | в хабе — вернуться в каталог, иначе закрыть Mini App |
| `onBack(fn \| null)` | своя обработка кнопки «Назад»; `null` — «Назад» закрывает игру |
| `setColors({ header, background, bottomBar })` | цвета шапки и фона Telegram |
| `haptic.impact(style)`, `haptic.notification(type)`, `haptic.selection()` | вибрация |
| `openLink(url)`, `openTelegramLink(url)` | ссылки |
| `shareMessage(id): Promise<boolean>` | окно «Поделиться» для сообщения, подготовленного ботом |
| `supports('8.0')` | поддерживает ли клиент нужную версию Bot API |

Безопасные зоны выставляются теми же CSS-переменными, что и в Telegram (`--tg-safe-area-inset-*`, `--tg-content-safe-area-inset-*`), в обоих режимах.

## Для хаба

`@naming-issues/sdk/host`: `createHost({ iframe, startParam, onReady, onExit })` принимает вызовы игры из iframe и выполняет их через `Telegram.WebApp`. Хаб добавляет к адресу игры параметр `?niHost=1`: по нему игра понимает, что запущена внутри хаба.

## Разработка

```
npm install
npm run build      # dist/ коммитится: пакет ставится из архива тега без сборки
```

Выпуск версии: поднять `version` в `package.json`, собрать, закоммитить вместе с `dist/` и поставить тег `vX.Y.Z`.
