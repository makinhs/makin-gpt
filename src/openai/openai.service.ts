import { ALFRED_ASSISTANT } from './assistants/alfred.assistant';
import { YAGA_YAGA_ASSISTANT } from './assistants/yagayaga.assistant';
import OpenAI from 'openai/index';
import { CONFIG_VARIABLES } from '../common/config';
import { CHAT_COMMANDS } from './commands';

const userMessagesPerModel = new Map([
  ['alfred', ALFRED_ASSISTANT],
  ['yaga-yaga', YAGA_YAGA_ASSISTANT],
]);

const user_messages = new Map();
const openai = new OpenAI({
  apiKey: CONFIG_VARIABLES.OPENAI_API_KEY,
});
let total_tokens = 400;

const getUserBotKey = (userId, botModel) => `${userId}-${botModel}`;

export const sendMessage = async (userId, text, botModel = 'alfred') => {
  const userBotKey = getUserBotKey(userId, botModel);
  if (!user_messages.has(userBotKey)) {
    user_messages.set(userBotKey, [...userMessagesPerModel.get(botModel)]);
  }
  if (text.includes(CHAT_COMMANDS.CLEAR_HISTORY.cmd)) {
    user_messages.delete(userBotKey);
    return 'chat_cleared';
  }
  if (text.includes(CHAT_COMMANDS.LIST_ALL.cmd)) {
    return user_messages.get(userBotKey).reduce((acc, message) => {
      return acc + '\n' + message.role + ': ' + message.content;
    }, '');
  }
  if (text.includes(CHAT_COMMANDS.HELP.cmd)) {
    const commandArray = Object.values(CHAT_COMMANDS);
    return '\n' + commandArray.reduce((acc, command) => {
      return acc + `${command.cmd} - ${command.description}\n`;
    }, '');
  }
  user_messages.get(userBotKey).push({ role: "user", content: text });
  try {
    const response = await openai.chat.completions.create({
      messages: user_messages.get(userBotKey),
      model: CONFIG_VARIABLES.OPENAI_VERSION.GPT_4_MINI,
    });
    total_tokens = response.usage.total_tokens;
    let chatResponse = response?.choices[0].message.content;
    user_messages.get(userBotKey).push({ role: "assistant", content: chatResponse });
    if (user_messages.get(userBotKey).length > CONFIG_VARIABLES.MAX_MESSAGES) {
      user_messages.delete(userBotKey);
      chatResponse += '\n\n You reached the limit of messages. Chat history cleared';
    }
    return chatResponse;
  } catch (err) {
    console.error(err);
    user_messages.delete(userBotKey);
    return 'Probably total tokens is exceeded. Chat history cleared';
  }
}
