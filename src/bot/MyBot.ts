import mineflayer from 'mineflayer';
import { myIndex } from './main';
import fs from 'fs';
import { join } from 'path';
import { BotCommand } from './botTypes';
import { parseSync } from 'yargs';
import { pathfinder } from 'mineflayer-pathfinder';
import { setTimeout as delay } from 'node:timers/promises';
import TransitionService from './services/transition.service';
import CommsService from './services/comms.service';

export class MyBot {
  bot: mineflayer.Bot | null = null;
  transitionService: TransitionService | null = null;
  commsService: CommsService;
  readonly myOptions: mineflayer.BotOptions;
  private commands: BotCommand[] = [];
  public botNetUsernames: Set<string> = new Set();

  constructor(options: mineflayer.BotOptions) {
    this.myOptions = options;
    this.commsService = new CommsService(this);
  }

  public init() {
    if (this.bot) return;
    this.bot = mineflayer.createBot(this.myOptions);

    this.bot.loadPlugin(pathfinder);
    this.transitionService = new TransitionService(this, this.bot);

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

    this.bot.once('spawn', () => {
      this.transitionService?.init();
    });

    this.bot.on('error', err => {
      if (err.name == 'ECONNREFUSED') {
        console.error(
          `Failed to connect to ${this.myOptions.host}:${this.myOptions.port}`
        );
        return;
      } else if (err.message.includes('client timed out')) {
        console.error('Connection timed out for some reason');
        process.exit(1);
      }

      console.log('ErrorNameDebug:', err.name);
      console.error(err);
    });

    this.bot.on('death', async () => {
      console.log(`Bot ${this.bot?.username} died`);
      this.transitionService?.onDeath();

      await delay(1000);
      this.bot?.respawn();
    });

    this.bot.on('kicked', reason => {
      console.warn('Kicked:', reason);
      process.exit(0);
    });

    this.bot.on('chat', (username, message, _, raw) => {
      if (username === this.bot?.username) return;
      this.commsService.sendChat(message, username, raw);
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

        if (!cmd.default.name || typeof cmd.default.run !== 'function')
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
