import childProcess from 'node:child_process';
import { BotExec, BotIPCMsg } from './types';
import { realID } from './utils/realID';
import { join } from 'path';

class BotManager {
  public bots: BotExec[] = [];
  public chatIdentifiers: string[] = [];

  createBot(index = 0) {
    if (this.bots.some(bot => bot.botIndex === index))
      throw new Error('Bot already exists');

    const id = realID();
    const username = 'NochtTests' + (index > 0 ? '_' + (index + 1) : '');

    const child = childProcess.fork(
      join(__dirname, './bot/main.js'),
      [id + '', index + '', username],
      {
        cwd: '../'
      }
    );

    const bot = {
      id,
      child,
      username,
      botIndex: index
    } satisfies BotExec;

    this.bots.push(bot);

    bot.child.on('close', code => this.closeOrError(bot, code));
    bot.child.on('error', err => this.closeOrError(bot, err));
    bot.child.on('message', (msg: BotIPCMsg) => this.onMessage(bot, msg));
  }

  private closeOrError(bot: BotExec, data: Error | number | null) {
    if (data instanceof Error) {
      console.error(`<ERROR-@${bot.botIndex}> Process closed by error: `, data);
    } else {
      console.log(`<LOG-@${bot.botIndex}> Process closed with code: `, data);
    }

    this.bots.splice(
      this.bots.findIndex(botExec => (botExec.id = bot.id)),
      1
    );

    this.createBot(bot.botIndex);
  }

  private onMessage(bot: BotExec, msg: BotIPCMsg) {
    if (msg.type === 'chat') {
      const myIdentifier = msg.username + msg.message.split(' ')[0];

      if (this.chatIdentifiers.some(identifier => identifier === myIdentifier))
        return;
      this.chatIdentifiers.push(myIdentifier);
      setTimeout(() => {
        // Puede llegar a tener un problema a futuro
        this.chatIdentifiers = this.chatIdentifiers.filter(
          identifier => identifier !== myIdentifier
        );
      }, 4000);

      console.log(`<LOG-@${bot.botIndex}> [${msg.username}] ${msg.message}`);

      return;
    }
    console.warn(msg);
  }
}

export const botManager = new BotManager();
