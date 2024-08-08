import { CONFIG_VARIABLES } from './common/config';
import {
  alfredApp,
  yagayagaApp,
} from './slack/slack.config';

(async () => {
  const port = CONFIG_VARIABLES.PORT;
  const port2 = CONFIG_VARIABLES.PORT_2;
  await alfredApp.start(port);
  await yagayagaApp.start(port2);
  console.log(`⚡️ Slack Bolt app is running on port ${port} and ${port2}!`);
})();
