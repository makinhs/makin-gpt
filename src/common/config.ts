import dotenv from "dotenv";
dotenv.config();
export const CONFIG_VARIABLES = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_VERSION: {
    GPT_3_5_TURBO: 'gpt-3.5-turbo',
    GPT_4_MINI: 'gpt-4o-mini'
  },
  OPENAI_ROLES: {
    user: "user",
    assistant: 'assistant'
  },
  PORT: +process.env.PORT || 3000,
  PORT_2: +process.env.PORT || 3001,
  SLACK_BOT_CHANNEL: process.env.SLACK_BOT_CHANNEL || 'D05QV36TW5Q',
  YAGA_YAGA_BOT_CHANNEL: process.env.YAGA_YAGA_BOT_CHANNEL || 'D07G0E826BF',
  MAX_MESSAGES: 50
}
