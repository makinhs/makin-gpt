import {ALFRED_ASSISTANT} from './assistants/alfred.assistant';
import OpenAI from 'openai/index';
import {CONFIG_VARIABLES} from '../common/config';

const user_messages = new Map();
const openai = new OpenAI({
  apiKey: CONFIG_VARIABLES.OPENAI_API_KEY,
});


export const sendMessage = async (userId: string, text: string, clear = false) => {
  if (!user_messages.has(userId)) {
    user_messages.set(userId, ALFRED_ASSISTANT);
  }
  if (text.indexOf('cmd:clear_history') > -1) {
    user_messages.delete(userId);
    return 'chat_cleared'
  }
  if (text.indexOf('cmd:list_all') > -1) {
    return user_messages.get(userId).reduce((acc, message) => {
      return acc + '\n' + message.role + ': ' + message.content;
    });
  }
  user_messages.get(userId).push({role: "user", content: text});
  const response = await openai.chat.completions.create({
    messages: user_messages.get(userId),
    model: CONFIG_VARIABLES.OPENAI_VERSION.GPT_3_5_TURBO,
  });
  let chatResponse = response?.choices[0].message.content;
  user_messages.get(userId).push({role: "assistant", content: chatResponse});
  if(user_messages.get(userId).length > CONFIG_VARIABLES.MAX_MESSAGES){
    user_messages.delete(userId);
    chatResponse += '\n\n You reached the limit of messages. Chat history cleared'
  }
  return chatResponse;
}