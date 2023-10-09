import {ALFRED_ASSISTANT} from './assistants/alfred.assistant';
import OpenAI from 'openai/index';
import {CONFIG_VARIABLES} from '../common/config';
import {CHAT_COMMANDS} from './commands';

const user_messages = new Map();
const openai = new OpenAI({
  apiKey: CONFIG_VARIABLES.OPENAI_API_KEY,
});
let total_tokens = 400;

export const sendMessage = async (userId: string, text: string, clear = false) => {
  if (!user_messages.has(userId)) {
    user_messages.set(userId, [...ALFRED_ASSISTANT]);
  }
  if (text.indexOf(CHAT_COMMANDS.CLEAR_HISTORY.cmd) > -1) {
    user_messages.delete(userId);
    return 'chat_cleared'
  }
  if (text.indexOf(CHAT_COMMANDS.LIST_ALL.cmd) > -1) {
    return user_messages.get(userId).reduce((acc, message) => {
      return acc + '\n' + message.role + ': ' + message.content;
    });
  }
  if (text.indexOf(CHAT_COMMANDS.HELP.cmd) > -1) {
    const commandArray = Object.values(CHAT_COMMANDS);
    return '\n' + commandArray.reduce((acc, command) => {
      return acc + `${command.cmd} - ${command.description}\n`;
    }, '');
  }
  user_messages.get(userId).push({role: "user", content: text});
 try{
   const response = await openai.chat.completions.create({
     messages: user_messages.get(userId),
     model: CONFIG_VARIABLES.OPENAI_VERSION.GPT_3_5_TURBO,
   });
   total_tokens = response.usage.total_tokens;
   let chatResponse = response?.choices[0].message.content;
   user_messages.get(userId).push({role: "assistant", content: chatResponse});
   if(user_messages.get(userId).length > CONFIG_VARIABLES.MAX_MESSAGES){
     user_messages.delete(userId);
     chatResponse += '\n\n You reached the limit of messages. Chat history cleared'
     console.log(user_messages.get(userId));
   }
   return chatResponse;
 }catch(err){
   console.log(err);
   user_messages.delete(userId);
   return 'Probably total tokens is exceeded. Chat history cleared';
 }
}
