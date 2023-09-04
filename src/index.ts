import {CONFIG_VARIABLES} from './common/config';
import {app} from './slack/slack.config';

(async ()=>{
  const port = CONFIG_VARIABLES.PORT;
  await app.start(port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();