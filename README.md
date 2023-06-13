# telegram-printing-bot
> Telegram bot Printing service (Windows only)

```.env
SELECTED_PRINTER=
BOT_TOKEN=
AUTHORIZED_CHAT_IDS=1111111,-1112122,22222
```

## Commands:
- /print
- /printer
- /info

## Build 
`pkg index.js -o build\index`

## Ref
- [Create Service in windows](https://stackoverflow.com/questions/3582108/create-windows-service-from-executable)
- [Package node app](https://stackoverflow.com/questions/67897358/compile-nodejs-to-binary)
