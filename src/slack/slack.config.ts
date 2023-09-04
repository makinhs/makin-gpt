import {App} from '@slack/bolt';
import {sendMessage} from '../openai/openai.service';
import {CONFIG_VARIABLES} from '../common/config';

export const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode:true, // enable the following to use socket mode
  appToken: process.env.APP_TOKEN
});

const ALFRED_CHANNEL_ID = CONFIG_VARIABLES.SLACK_BOT_CHANNEL;
app.command("/alfred", async ({ command, ack, say }) => {
  try {
    await ack();
    if(command.channel_name.indexOf('directmessage')>-1){
      if(command.channel_id.indexOf(ALFRED_CHANNEL_ID)>-1){
        say({
          text: `You: ${command.text}`,
          channel: ALFRED_CHANNEL_ID,
        });
        const chatResponse = await sendMessage(command.user_id, command.text);
        say({
          text: chatResponse || 'something went wrong',
          channel: ALFRED_CHANNEL_ID,
        });
      }
    }else{
    }

  } catch (error) {
    console.log("err")
    console.error(error);
  }
});