const { Telegraf } = require("telegraf");
const shutDownWin = require('shutdownHelper');

const { print, getPrinters, getDefaultPrinter } = require("pdf-to-printer");

const fs = require("fs");
const request = require("request");
const path = require("path");
require("dotenv").config();
// const fetch = require("node-fetch");

config = {
  baseFilePath: "temp",
  botToken: process.env.BOT_TOKEN,
  printerOptions: {
    printer: process.env.SELECTED_PRINTER || '',
  },
  authorizedChatIds: process.env.AUTHORIZED_CHAT_IDS.split(',').map(id => parseInt(id))
};

const download = (url, fileName) =>
  new Promise((resolve, reject) =>
    request.head(url, (err, res, body) => {
      const filePath = path.join(__dirname, config.baseFilePath, fileName);
      request({ url })
        .pipe(fs.createWriteStream(filePath))
        .on("close", () => resolve(filePath));
    })
  );

const parseCommand = (cmdline) => {
  const re_next_arg =
    /^\s*((?:(?:"(?:\\.|[^"])*")|(?:'[^']*')|\\.|\S)+)\s*(.*)$/;
  let next_arg = ["", "", cmdline];
  let args = [];
  while ((next_arg = re_next_arg.exec(next_arg[2]))) {
    let quoted_arg = next_arg[1];
    let unquoted_arg = "";
    while (quoted_arg.length > 0) {
      if (/^"/.test(quoted_arg)) {
        let quoted_part = /^"((?:\\.|[^"])*)"(.*)$/.exec(quoted_arg);
        unquoted_arg += quoted_part[1].replace(/\\(.)/g, "$1");
        quoted_arg = quoted_part[2];
      } else if (/^'/.test(quoted_arg)) {
        let quoted_part = /^'([^']*)'(.*)$/.exec(quoted_arg);
        unquoted_arg += quoted_part[1];
        quoted_arg = quoted_part[2];
      } else if (/^\\/.test(quoted_arg)) {
        unquoted_arg += quoted_arg[1];
        quoted_arg = quoted_arg.substring(2);
      } else {
        unquoted_arg += quoted_arg[0];
        quoted_arg = quoted_arg.substring(1);
      }
    }
    args[args.length] = unquoted_arg;
  }
  return args;
};

const bot = new Telegraf(config.botToken);

bot.start((ctx) => ctx.reply("Welcome"));
bot.help((ctx) => ctx.reply("Contact 9772332434"));
bot.hears("hi", (ctx) => ctx.reply("Hey there"));

bot.command("info", (ctx) => {
  const chatId = ctx.update.message.chat.id
  ctx.reply(JSON.stringify({
    chatId,
    selectedPrinter: config.printerOptions.printer,
    userInfo: os.userInfo(),
    hostname: os.hostname(),
    machine: os.machine(),
    uptime: os.uptime(),
    version: os.version()
  }, null, 2));
});

bot.command("printer", async (ctx) => {
  try {
    const { text: command = "" } = ctx.update.message || {};
    const args = parseCommand(command);
    const printers = await getPrinters();

    let reply = "";

    if (args.length === 1) {
      const defaultPrinter = await getDefaultPrinter();
      reply = `List of printers \n${printers.map(({ name }, i) => `${i} - ${name}`).join('\n')}\nDefault: ${defaultPrinter}\nSelected: ${config.printerOptions.printer}`.trim();
    } else if (args.length === 3 && args[1] === "set" && (parseInt(args[2]) >= 0 && parseInt(args[2]) < printers.length)) {
      config.printerOptions.printer = printers[parseInt(args[2])].name;
      reply = `Selected ${printers[parseInt(args[2])].name}`;
    }

    ctx.reply(reply, {
      reply_to_message_id: ctx.message.message_id,
    });
  } catch (err) {
    ctx.reply("Internal Error");
    console.log(err);
  }
});

bot.command("print", async (ctx) => {
  try {
    const { reply_to_message = {}, text: command = "", chat: { id: chatId } } = ctx.update.message || {};
    const { document: file = {} } = reply_to_message;

    if (!config.authorizedChatIds.includes(chatId)) return ctx.reply("Unauthorized, please contact +919772332434");
    if (!file || !reply_to_message) return ctx.reply("Reply to a pdf file");

    if (file.mime_type !== "application/pdf")
      return ctx.reply("Files other than pdf not supported");

    const { file_id: fileId, file_unique_id: fileUniqueId } = file;
    const fileName = `${fileUniqueId}.pdf`;

    const fileUrl = await ctx.telegram.getFileLink(fileId);
    const filePath = await download(fileUrl, fileName);

    const args = parseCommand(command);
    copies = parseInt(args[1]) || 1

    await print(filePath, { ...config.printerOptions, copies })

    ctx.reply("Print job started", {
      reply_to_message_id: reply_to_message.message_id,
    });
  } catch (err) {
    ctx.reply("Internal Error");
    console.log(err);
  }
});

bot.command("shutdown", async (ctx) => {
  try {
    shutDownWin.shutdown(10, false, 'The system will shut down in 10 seconds, from Telegram command');
    ctx.reply("Shutting down computer in 10");
    bot.stop();
  } catch (err) {
    ctx.reply("Internal Error");
    console.log(err);
  }
})

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
