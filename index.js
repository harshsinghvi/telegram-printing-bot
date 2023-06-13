const { Telegraf } = require("telegraf");
const { message } = require("telegraf/filters");

const { print, getPrinters, getDefaultPrinter } = require("pdf-to-printer");

const fs = require("fs");
const request = require("request");
const path = require("path");
require("dotenv").config();
// const fetch = require("node-fetch");

config = {
  baseFilePath: "temp",
  botToken: process.env.BOT_TOKEN,
  printeOptions: {},
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

const bot = new Telegraf("1393239992:AAE9DH3sGfk1VNhma9-iZBl3Fo2HLK96UzU");

bot.start((ctx) => ctx.reply("Welcome"));
bot.help((ctx) => ctx.reply("Send me a sticker"));
bot.on(message("sticker"), (ctx) => ctx.reply("👍"));
bot.hears("hi", (ctx) => ctx.reply("Hey there"));

bot.command("oldschool", (ctx) => {
  console.log(ctx.chat);
  return ctx.reply("Hello");
});

bot.command("hipster", Telegraf.reply("λ"));

bot.command("printer", async (ctx) => {
  const { text: command = "" } = ctx.update.message || {};
  const args = parseCommand(command);
  let reply = "";
  if (args.length === 1) {
    reply = ```


  ```;
  } else if (args.length === 3 && args[1] === "set") {
    config.printeOptions.printer = "";
  }
  ctx.reply(reply, {
    reply_to_message_id: ctx.message.message_id,
  });
});

bot.command("print", async (ctx) => {
  try {
    // const file = ctx.update.message.reply_to_message.document;
    const { reply_to_message = {}, text: command = "" } =
      ctx.update.message || {};
    const { document: file = {} } = reply_to_message;

    if (!file || !reply_to_message) return ctx.reply("Reply to a pdf file");

    if (file.mime_type !== "application/pdf")
      return ctx.reply("Files other than pdf not supported");

    const { file_id: fileId, file_unique_id: fileUniqueId } = file;
    const fileName = `${fileUniqueId}.pdf`;

    const fileUrl = await ctx.telegram.getFileLink(fileId);
    const filePath = await download(fileUrl, fileName);

    const [copies] = parseCommand(command);

    ctx.reply("kk", {
      reply_to_message_id: reply_to_message.message_id,
    });
  } catch (err) {
    ctx.reply("Internal Error");
    console.log(err);
  }

  // ctx.telegram.getFileLink(fileId).then(url => {
  //     axios({url, responseType: 'stream'}).then(response => {
  //         return new Promise((resolve, reject) => {
  //             response.data.pipe(fs.createWriteStream(`${config.basePath}/public/images/profiles/${ctx.update.message.from.id}.jpg`))
  //                         .on('finish', () => /* File is saved. */)
  //                         .on('error', e => /* An error has occured */)
  //                 });
  //             })
  // })
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
