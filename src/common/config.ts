import dotenv from "dotenv";
dotenv.config();
export const CONFIG_VARIABLES = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_VERSION: {
    GPT_3_5_TURBO: 'gpt-3.5-turbo'
  },
  OPENAI_ROLES: {
    user: "user",
    assistant: 'assistant'
  },
  PORT: process.env.PORT || 3000,
  SLACK_BOT_CHANNEL: process.env.SLACK_BOT_CHANNEL || 'D05QV36TW5Q',
}