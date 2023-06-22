# telegram-printing-bot

> Telegram bot Printing service (Windows only), Small Schale Cloud Printing alternative

```.env
SELECTED_PRINTER=
BOT_TOKEN=
AUTHORIZED_CHAT_IDS=1111111,-1112122,22222
```

## Commands:

- /print
- /printer
- /info

## Instuctions

- if you use group chat (for access management), enble chat visibility for new members and add the bot, and chat if in env file 

## Build 

`pkg index.js -o build\index`

> copy `build\index.exe` and `.env` files to destination directory run index.exe

## Ref

- [Create Service in windows 1](https://stackoverflow.com/questions/3582108/create-windows-service-from-executable)
- [Create Service in windows 2](https://stackoverflow.com/questions/20445599/auto-start-node-js-server-on-boot)
- [Create Service in windows 3](https://github.com/tallesl/qckwinsvc)
- [Package node app](https://stackoverflow.com/questions/67897358/compile-nodejs-to-binary)
