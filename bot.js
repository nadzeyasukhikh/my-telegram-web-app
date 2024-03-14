require("dotenv").config();
const { Telegraf, session, Markup } = require("telegraf");
const axios = require("axios");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.use(session());

bot.use((ctx, next) => {
  if (ctx.message && ctx.message.text) {
    console.log(`Пользователь ${ctx.from.id} отправил текст: ${ctx.message.text}`);
  }
  return next();
});

bot.start((ctx) => {
  ctx.session = {};
  ctx.reply("Привет! Как тебя зовут?");
  ctx.session.stage = "awaiting_name";
});

async function sendToGPT(ctx) {
  const GPT_BOT_API_URL = 'https://api.openai.com/v1/chat/completions';
  const MIN_REQUEST_INTERVAL = 20000; // 20 seconds
  let lastRequestTime = 0;

  const currentTime = new Date().getTime();
  if (currentTime - lastRequestTime < MIN_REQUEST_INTERVAL) {
    ctx.reply("Превышен лимит запросов к GPT-боту. Пожалуйста, попробуйте позже.");
    return;
  }

  const axiosConfig = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    timeout: 60000
  };

  try {
    const userMessage = ctx.message && ctx.message.text ? ctx.message.text : "Привет, GPT!";
    const response = await axios.post(GPT_BOT_API_URL, {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: userMessage }
      ]
    }, axiosConfig);

    console.log("Ответ от GPT-бота:", response.data);

    if (response.data && response.data.choices && response.data.choices.length > 0 && response.data.choices[0].message && response.data.choices[0].message.content) {
      ctx.reply(response.data.choices[0].message.content);
      lastRequestTime = currentTime;
    } else {
      console.error("Ошибка: Некорректный формат ответа от GPT-бота");
      ctx.reply("Произошла ошибка при вызове GPT-бота.");
    }
  } catch (error) {
    console.error('Ошибка при вызове GPT-бота:', error.response ? error.response.data : error.message);
    ctx.reply("Произошла ошибка при вызове GPT-бота.");
  }
}

bot.on("text", async (ctx) => {
  if (!ctx.session) {
    console.log("Ошибка: сессия не найдена.");
    return ctx.reply("Произошла ошибка с сессией, попробуйте начать заново с команды /start.");
  }

  switch (ctx.session.stage) {
    case "awaiting_name":
      ctx.session.name = ctx.message.text;
      console.log(`Имя получено: ${ctx.session.name}`);
      ctx.reply("Отлично! Теперь, пожалуйста, введите свою дату рождения в формате ДД.ММ.ГГГГ.");
      ctx.session.stage = "awaiting_dob";
      break;

    case "awaiting_dob":
      ctx.session.dob = ctx.message.text;
      console.log(`Дата рождения получена: ${ctx.session.dob}`);

      await ctx.replyWithHTML(`Спасибо, ${ctx.session.name}! Теперь вы можете перейти в мое приложение, нажав кнопку "open" или начать общение с GPT-ботом, нажав кнопку "GPT-бот".`,
        Markup.inlineKeyboard([
          Markup.button.callback("GPT-бот", "call_gpt_bot")
        ])
      );

      delete ctx.session.stage; 
      break;

    default:
      
      await sendToGPT(ctx);
      break;
  }
});


bot.action("call_gpt_bot", async (ctx) => {
  
  await sendToGPT(ctx);
});

bot.launch();