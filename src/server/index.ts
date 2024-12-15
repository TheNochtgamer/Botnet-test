import 'dotenv/config';
import yargs from 'yargs';
import { setTimeout as delay } from 'node:timers/promises';
import { botManager } from './manager';

const _args = yargs.parseSync(process.argv);

(async () => {
  const botsQ = parseInt(_args.bots + '') || 1;
  console.log(`Creating ${botsQ} bot${botsQ > 1 ? 's' : ''}`);

  for (let index = 0; index < botsQ; index++) {
    botManager.createBot(index);

    await delay(5 * 1000);
  }
})();
