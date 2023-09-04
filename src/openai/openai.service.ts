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
  } else {
    if (text.indexOf('clear_history') > -1) {
      user_messages.delete(userId);
      return 'chat_cleared'
    }
  }
  user_messages.get(userId).push({role: "user", content: text});
  const response = await openai.chat.completions.create({
    messages: user_messages.get(userId),
    model: CONFIG_VARIABLES.OPENAI_VERSION.GPT_3_5_TURBO,
  });
  const chatResponse = response?.choices[0].message.content;
  user_messages.get(userId).push({role: "assistant", content: chatResponse});
  return chatResponse;
}