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
  ctx.reply("Привет! Как тебя зовут?");
  // Проверяем наличие объекта ctx.session и инициализируем его, если он еще не определен
  if (!ctx.session) {
    ctx.session = {};
  }
  ctx.session.stage = "awaiting_name";
});

bot.on("text", (ctx) => {
  // Проверяем наличие объекта ctx.session и инициализируем его, если он еще не определен
  if (!ctx.session) {
    ctx.session = {};
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
      ctx.reply(`Спасибо, ${ctx.session.name}! Теперь ты можешь перейти на следующий шаг: /next_step`);
      // Очистка только стадии сессии перед следующим шагом
      delete ctx.session.stage;
      break;
    default:
      console.log("Неизвестный этап: ", ctx.session.stage);
      ctx.reply("Я не уверен, что от меня требуется. Пожалуйста, начни сначала с команды /start.");
  }
});

// Обработка команды для перехода на следующий шаг приложения
bot.command("next_step", (ctx) => {
  ctx.reply("Переход на следующий шаг приложения...");
  // Очистка только стадии сессии перед следующим шагом
  delete ctx.session.stage;
});

bot.launch();