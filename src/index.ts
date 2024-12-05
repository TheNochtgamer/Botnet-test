import 'dotenv/config';
import { setTimeout as delay } from 'timers/promises';
import { botManager } from './manager';

(async () => {
  for (let index = 0; index < 1; index++) {
    botManager.createBot(index);

    await delay(5 * 1000);
  }
})();
