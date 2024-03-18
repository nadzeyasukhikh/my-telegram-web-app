require("dotenv").config();
const { Telegraf, session, Markup } = require("telegraf");
const axios = require("axios");
const admin = require("firebase-admin");
const { v4: uuidv4 } = require('uuid');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.use(session());

bot.use((ctx, next) => {
  if (ctx.message && ctx.message.text) {
    console.log(`Пользователь ${ctx.from.id} отправил текст: ${ctx.message.text}`);
  }
  return next();
});

bot.command("gpt", async (ctx) => {
  await sendToGPT(ctx);
  ctx.session.stage = "gpt_bot_mode";
});

bot.command('start', async (ctx) => {
  ctx.session = ctx.session || {};
  
  const userId = ctx.from.id;
  const isAuthorized = await checkUserAuth(userId);
  if (isAuthorized) {
    await ctx.reply('Вы уже авторизованы.');
  } else {
    await ctx.reply('Привет! Пожалуйста, укажите ваше имя:');
    ctx.session.stage = 'awaiting_name';
  }
});


bot.command("gallery", async (ctx) => {
  try {
    const userId = ctx.from.id.toString();
    const photos = await getPhotosFromGallery(userId);

    if (photos.length === 0) {
      await ctx.reply('В вашей галерее пока нет фотографий.');
      return;
    }

    for (const fileId of photos) {
      const shortId = uuidv4(); // Генерируем короткий идентификатор
      await db.collection('photo_mappings').doc(shortId).set({ fileId }); // Сохраняем соответствие в базе данных
      await ctx.replyWithPhoto(fileId, Markup.inlineKeyboard([
        Markup.button.callback('Удалить', `delete_${shortId}`) // Используем короткий идентификатор в данных callback
      ]));
    }
  } catch (error) {
    console.error("Ошибка при выполнении команды /gallery: ", error);
    await ctx.reply('Произошла ошибка при попытке показать галерею. Пожалуйста, попробуйте позже.');
  }
});


bot.on('text', async (ctx) => {
  if (ctx.session.stage === 'awaiting_name') {
    ctx.session.name = ctx.message.text;
    await ctx.reply('Отлично! Теперь укажите вашу дату рождения в формате ДД.ММ.ГГГГ:');
    ctx.session.stage = 'awaiting_dob';
  } else if (ctx.session.stage === 'awaiting_dob') {
    ctx.session.dob = ctx.message.text;
    await saveUserAuth(ctx.from.id, ctx.session.name, ctx.session.dob);
    await ctx.reply('Вы успешно авторизованы!');
    delete ctx.session.stage;
    await ctx.reply('Теперь вы можете создать свою галерею фотографий. Нажмите кнопку ниже, чтобы начать.', 
      Markup.inlineKeyboard([
        Markup.button.callback('Создать галерею', 'create_gallery')
      ])
    );
  } else if (ctx.session.stage === 'gpt_bot_mode') {
    await sendToGPT(ctx);
  }
});

bot.action('create_gallery', async (ctx) => {
  const userId = ctx.from.id;
  await createPhotoGallery(userId);
  await ctx.reply('Галерея фотографий успешно создана! Теперь вы можете загружать свои фотографии.');
});

bot.action(/^delete_(.+)$/, async (ctx) => {
  const shortId = ctx.match[1];
  const doc = await db.collection('photo_mappings').doc(shortId).get();
  if (!doc.exists) {
    await ctx.answerCbQuery('Не удалось найти фотографию для удаления.');
    return;
  }

  const { fileId } = doc.data();
  const userId = ctx.from.id.toString();
  await removePhotoFromGallery(userId, fileId);
  await ctx.answerCbQuery('Фотография удалена из галереи.');
  await ctx.deleteMessage();
});


async function saveUserAuth(userId, name, dob) {
  try {
    await db.collection('users').doc(userId.toString()).set({
      name: name,
      dob: dob,
      authorized: true
    });
    console.log('Данные пользователя сохранены в Firebase.');
  } catch (error) {
    console.error('Ошибка при сохранении данных пользователя в Firebase:', error);
  }
}

async function checkUserAuth(userId) {
  try {
    const userDoc = await db.collection('users').doc(userId.toString()).get();
    return userDoc.exists && userDoc.data().authorized;
  } catch (error) {
    console.error('Ошибка при проверке данных аутентификации пользователя:', error);
    return false;
  }
}

async function createPhotoGallery(userId) {
  try {
    await db.collection('photo_galleries').doc(userId.toString()).set({
      photos: []
    });
    console.log('Галерея фотографий создана для пользователя', userId);
  } catch (error) {
    console.error('Ошибка при создании галереи фотографий:', error);
  }
}





async function addPhotoToGallery(userId, fileId) {
  try {
    await db.collection('photo_galleries').doc(userId.toString()).update({
      photos: admin.firestore.FieldValue.arrayUnion(fileId)
    });
    console.log('Фотография успешно добавлена в галерею для пользователя', userId);
  } catch (error) {
    console.error('Ошибка при добавлении фотографии в галерею:', error);
  }
}

async function getPhotosFromGallery(userId) {
  try {
    const doc = await db.collection('photo_galleries').doc(userId.toString()).get();
    if (doc.exists) {
      const data = doc.data();
      return data.photos; // Просто возвращаем массив file_id
    } else {
      console.log('Для пользователя', userId, 'галерея фотографий не найдена.');
      return [];
    }
  } catch (error) {
    console.error('Ошибка при получении фотографий из галереи:', error);
    return [];
  }
}

async function removePhotoFromGallery(userId, fileId) {
  try {
    await db.collection('photo_galleries').doc(userId.toString()).update({
      photos: admin.firestore.FieldValue.arrayRemove(fileId)
    });
    console.log('Фотография успешно удалена из галереи для пользователя', userId);
  } catch (error) {
    console.error('Ошибка при удалении фотографии из галереи:', error);
    throw error; // Перебросить ошибку для последующей обработки
  }
}



bot.on('photo', async (ctx) => {
  const userId = ctx.from.id;
  // Используйте file_id последней (самой большой) фотографии в массиве
  const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
  
  await addPhotoToGallery(userId, fileId); // Сохраняем file_id в базе данных
  try {
    await ctx.replyWithPhoto(fileId); // Отправляем фотографию обратно пользователю для подтверждения
    await ctx.reply('Фотография успешно добавлена в вашу галерею!');
  } catch (error) {
    console.error('Ошибка при отправке фото:', error);
    await ctx.reply('Произошла ошибка при отправке фотографии.');
  }
});



let lastRequestTime = 0;



async function sendToGPT(ctx) {
  const GPT_BOT_API_URL = 'https://api.openai.com/v1/chat/completions';
  const MIN_REQUEST_INTERVAL = 5000; 
  

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

bot.launch();