import mineflayer from 'mineflayer';
import { myIndex, sendChat } from './main';
import fs from 'fs';
import { join } from 'path';
import { BotCommand } from './bottypes';
import { parseSync } from 'yargs';

export class MyBot {
  bot: mineflayer.Bot | null = null;
  readonly myOptions: mineflayer.BotOptions;
  private commands: BotCommand[] = [];

  constructor(
    options: mineflayer.BotOptions = {
      host: process.env.MCHOST,
      port: 25565,
      username: process.argv[3] || 'NochtTests',
      auth: 'offline',
      viewDistance: 'tiny'
    }
  ) {
    this.myOptions = options;
  }

  public init() {
    if (this.bot) return;
    this.bot = mineflayer.createBot(this.myOptions);
    this.initEvents();
    this.initCommands();
  }

  private initEvents() {
    if (!this.bot) return;
    this.bot.on('login', () => {
      console.log('Bot logged in');
    });

    this.bot.on('spawn', () => {
      console.log(`"${this.myOptions.username}" Bot spawned`);
    });

    this.bot.on('error', err => {
      if (err.name == 'ECONNREFUSED') {
        console.error(
          `Failed to connect to ${this.myOptions.host}:${this.myOptions.port}`
        );
        return;
      }

      console.error(err);
    });

    this.bot.on('kicked', reason => {
      console.warn('Kicked:', reason);
    });

    this.bot.on('chat', (username, message, _, raw) => {
      if (username === this.bot?.username) return;
      sendChat(message, username, raw);
      this.cmdHandler(username, message, 'chat');
    });

    this.bot.on('whisper', (username, message) => {
      console.log(`"${username}" whispered me: ${message}`);
      this.cmdHandler(username, message, 'whisper');
    });
  }

  private async initCommands() {
    if (!this.bot) return;

    const cmdFiles = fs.readdirSync(join(__dirname, 'commands'), {
      withFileTypes: true
    });

    for (const file of cmdFiles) {
      // Si no es un archivo o si no tiene la extension .c. continua
      if (!file.isFile() || !file.name.match(/.c./i)) continue;

      try {
        const cmd = await import(join(__dirname, 'commands', file.name));
        if (!cmd.default) new Error('Commands needs a structure');

        if (
          !cmd.default.name ||
          !cmd.default.match ||
          typeof cmd.default.run !== 'function'
        )
          throw new Error('Invalid command structure');

        this.commands.push(cmd.default);
      } catch (error) {
        console.error(`Error importing command "${file.name}":`, error);
      }
    }
  }

  public async cmdHandler(
    sender: string,
    message: string,
    senderType: 'chat' | 'whisper' | 'internal'
  ) {
    if (!this.bot) return;

    /*
@1
NochtTests_1
@NochtTests_1
/msg NochtTests_1 @

@all
@a
    */

    // Check if this is a command
    if (!message.startsWith('@') || !message.startsWith(this.bot.username))
      return;

    // Authorizations
    if (!(process.env.OWNERS_USERS || '').split(',').includes(sender)) return;

    // Extra cases
    if (senderType === 'whisper') {
      if (message.match(/^@(all|a)/i)) {
        // Send message to the parent manager
      } else if (
        message.match(/^(|@)[0-9]+/i) &&
        !message.match(new RegExp('^(|@)' + myIndex, 'i'))
      ) {
        // Send message to the parent manager
      }
    }

    if (
      !message.match(new RegExp('^(|@)' + this.bot.username, 'i')) ||
      !message.match(new RegExp('^(|@)' + myIndex, 'i')) ||
      !message.match(/^@(all|a)/i) ||
      !(message.startsWith('@') && senderType === 'whisper')
    )
      return;

    // Parseo y ejecucion
    const args = parseSync(message);

    const command = this.commands.find(
      cmd =>
        cmd.name === String(args._[0]) ||
        cmd.aliases?.includes(String(args._[0]))
    );

    if (!command) {
      this.bot.whisper(sender, 'Invalid command');
      return;
    }

    try {
      await command.run(this, sender, args, message);
    } catch (error) {
      console.error('Error executing command:', error);
    }
  }
}
