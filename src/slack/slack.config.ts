import { App } from '@slack/bolt';
import { sendMessage } from '../openai/openai.service';
import { CONFIG_VARIABLES } from '../common/config';

// Initialize Alfred's Slack App
export const alfredApp = new App({
  token: process.env.SLACK_BOT_TOKEN_ALFRED,
  signingSecret: process.env.SLACK_SIGNING_SECRET_ALFRED,
  socketMode: true, // enable the following to use socket mode
  appToken: process.env.APP_TOKEN_ALFRED,
});

const ALFRED_CHANNEL_ID = CONFIG_VARIABLES.SLACK_BOT_CHANNEL;

alfredApp.command("/alfred", async ({ command, ack, say }) => {
  try {
    await ack();
    if (command.channel_name.includes('directmessage') && command.channel_id === ALFRED_CHANNEL_ID) {
      say({ text: `You: ${command.text}`, channel: ALFRED_CHANNEL_ID });
      const chatResponse = await sendMessage(command.user_id, command.text, 'alfred');
      say({ text: `Alfred: ${chatResponse}` || 'Alfred: something went wrong', channel: ALFRED_CHANNEL_ID });
    }
  } catch (error) {
    console.error("Error:", error);
  }
});

// Initialize Yaga-Yaga's Slack App
export const yagayagaApp = new App({
  token: process.env.SLACK_BOT_TOKEN_YAGAYAGA,
  signingSecret: process.env.SLACK_SIGNING_SECRET_YAGAYAGA,
  socketMode: true, // enable the following to use socket mode
  appToken: process.env.APP_TOKEN_YAGAYAGA,
});

const YAGA_YAGA_CHANNEL_ID = CONFIG_VARIABLES.YAGA_YAGA_BOT_CHANNEL;

yagayagaApp.command("/yaga", async ({ command, ack, say }) => {
  try {
    await ack();
    if (command.channel_name.includes('directmessage')) {
      say({ text: `You: ${command.text}`, channel: YAGA_YAGA_CHANNEL_ID });
      const chatResponse = await sendMessage(command.user_id, command.text, 'yaga-yaga');
      say({ text: `Yaga-yaga: ${chatResponse}` || 'Yaga-yaga: something went wrong', channel: YAGA_YAGA_CHANNEL_ID });
    }
  } catch (error) {
    console.error("Error:", error);
  }
});
