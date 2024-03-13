require("dotenv").config();
const { Telegraf, session } = require("telegraf");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);


bot.use(session());


bot.use((ctx, next) => {
  console.log(`Пользователь ${ctx.from.id} отправил текст: ${ctx.message.text}`);
  return next();
});

bot.start((ctx) => {
  ctx.session = {}; 
  ctx.reply("Привет! Как тебя зовут?");
  ctx.session.stage = "awaiting_name";
});

bot.on("text", (ctx) => {
  if (!ctx.session) {
    console.log("Ошибка: сессия не найдена.");
    return ctx.reply("Произошла ошибка с сессией, попробуйте начать заново с команды /start.");
  }

  console.log(ctx.session); 

  switch (ctx.session.stage) {
    case "awaiting_name":
      ctx.session.name = ctx.message.text;
      console.log(`Имя получено: ${ctx.session.name}`);
      ctx.reply("Отлично! Теперь, пожалуйста, введи свою дату рождения в формате ДД.ММ.ГГГГ.");
      ctx.session.stage = "awaiting_dob";
      break;
    case "awaiting_dob":
      ctx.session.dob = ctx.message.text;
      console.log(`Дата рождения получена: ${ctx.session.dob}`);
      ctx.replyWithHTML(`Спасибо, ${ctx.session.name}! Теперь ты можешь перейти в мое приложение нажимая кнопу open ниже `);
      
      delete ctx.session.stage;
      break;
    default:
      console.log("Неизвестный этап: ", ctx.session.stage);
      ctx.reply("Я не уверен, что от меня требуется. Пожалуйста, начни сначала с команды /start.");
  }
});

bot.launch();