import childProcess from 'node:child_process';
import { BotExec, BotMessage } from './types';
import { realID } from './utils/realID';
import { join } from 'path';

class BotManager {
  public bots: BotExec[] = [];
  public chatIdentifiers: string[] = [];

  createBot(index = 0) {
    const id = realID();
    const username = 'NochtTests' + (index > 0 ? '_' + (index + 1) : '');

    const child = childProcess.fork(
      join(__dirname, './bot/main.js'),
      [id + '', username],
      {
        cwd: '../'
      }
    );

    const bot = {
      id,
      child,
      username
    };

    this.bots.push(bot);

    bot.child.on('error', err => {
      console.error(`<ERROR-#${bot.id}>`, err);

      this.bots.splice(
        this.bots.findIndex(botExec => (botExec.id = id)),
        1
      );

      this.createBot(index);
    });

    bot.child.on('close', code => {
      console.log(`<LOG-#${bot.id}> Closed with code ${code}`);
      this.bots.splice(
        this.bots.findIndex(botExec => (botExec.id = id)),
        1
      );

      this.createBot(index);
    });

    bot.child.on('message', (msg: BotMessage) => {
      if (msg.type === 'chat') {
        const myIdentifier = msg.username + msg.message.split(' ')[0];

        if (
          this.chatIdentifiers.some(identifier => identifier === myIdentifier)
        )
          return;
        this.chatIdentifiers.push(myIdentifier);
        setTimeout(() => {
          // Puede llegar a tener un problema a futuro
          this.chatIdentifiers = this.chatIdentifiers.filter(
            identifier => identifier !== myIdentifier
          );
        }, 4000);

        console.log(`<LOG-#${bot.id}> [${msg.username}] ${msg.message}`);
        console.log('Raw:', msg.raw);

        return;
      }
      console.warn(msg);
    });
  }
}

export const botManager = new BotManager();
