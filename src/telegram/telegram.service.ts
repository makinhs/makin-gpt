import { CONFIG_VARIABLES } from '../common/config';
import TelegramBot from 'node-telegram-bot-api';
import { sendMessage } from '../openai/openai.service';

type BOT_MODEL = 'alfred' | 'yaga-yaga';

const userRequestLimits = new Map();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;
const MAX_MESSAGES_PER_USER = 20;

function getToken(botModel: BOT_MODEL) {
  switch (botModel) {
    case 'alfred':
      return CONFIG_VARIABLES.TELEGRAM.ALFRED_TOKEN;
    case 'yaga-yaga':
      return CONFIG_VARIABLES.TELEGRAM.YAGA_YAGA_TOKEN;
    default:
      throw new Error(`Unknown bot model: ${botModel}`);
  }
}

function isRateLimited(userId) {
  const currentTime = Date.now();
  const userData = userRequestLimits.get(userId) || { requests: 0, firstRequestTime: currentTime, messageCount: 0 };

  // Reset the window if it's expired
  if (currentTime - userData.firstRequestTime > RATE_LIMIT_WINDOW_MS) {
    userData.requests = 0;
    userData.firstRequestTime = currentTime;
  }

  if (userData.requests >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  userData.requests += 1;
  userData.messageCount += 1;
  userRequestLimits.set(userId, userData);
  return false;
}

function hasExceededMessageLimit(userId) {
  const userData = userRequestLimits.get(userId);
  return userData?.messageCount >= MAX_MESSAGES_PER_USER;
}

export const startTelegramBot = (botModel: BOT_MODEL) => {
  try {
    const token = getToken(botModel);
    const bot = new TelegramBot(token, { polling: true });

    bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      const userMessage = msg.text;

      console.log(`${botModel} - Incoming message from Telegram`);
      console.log(`User ID: ${userId}`);
      console.log(`Message: ${userMessage}`);

      if (isRateLimited(userId)) {
        bot.sendMessage(chatId, 'You are sending messages too quickly. Please slow down.');
        return;
      }

      if (hasExceededMessageLimit(userId)) {
        bot.sendMessage(chatId, 'You have reached the maximum number of messages allowed. Please try again later.');
        return;
      }

      try {
        const chatResponse = await sendMessage(userId, userMessage, botModel);
        console.log(`${botModel} - Response:`);
        console.log(chatResponse);

        // Send the bot's response back to the user
        await bot.sendMessage(chatId, chatResponse);
      } catch (err) {
        console.error(`Error processing message for ${botModel}:`, err);
        bot.sendMessage(chatId, 'Sorry, something went wrong while processing your message.');
      }
    });

    console.log(`Telegram bot for ${botModel} started successfully.`);
  } catch (err) {
    console.error(`Failed to start Telegram bot for ${botModel}:`, err);
  }
}
