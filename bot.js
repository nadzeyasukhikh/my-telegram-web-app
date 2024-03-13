require("dotenv").config();
const { Telegraf, session } = require("telegraf");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Включаем встроенную поддержку сессий
bot.use(session());

// Логирование для отслеживания активности
bot.use((ctx, next) => {
  console.log(`Пользователь ${ctx.from.id} отправил текст: ${ctx.message.text}`);
  return next();
});

bot.start((ctx) => {
  ctx.session = {}; // Инициализируем сессию, если она не существует
  ctx.reply("Привет! Как тебя зовут?");
  ctx.session.stage = "awaiting_name";
});

bot.on("text", (ctx) => {
  if (!ctx.session) {
    console.log("Ошибка: сессия не найдена.");
    return ctx.reply("Произошла ошибка с сессией, попробуйте начать заново с команды /start.");
  }

  console.log(ctx.session); // Логируем текущее состояние сессии

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
      ctx.reply(`Спасибо, ${ctx.session.name}! Теперь ты можешь перейти в приложение: https://my-telegram-web-app.vercel.app/?openInPopup=true`);
      // Очистка только стадии сессии перед следующим шагом
      delete ctx.session.stage;
      break;
    default:
      console.log("Неизвестный этап: ", ctx.session.stage);
      ctx.reply("Я не уверен, что от меня требуется. Пожалуйста, начни сначала с команды /start.");
  }
});

bot.launch();