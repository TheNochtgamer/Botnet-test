import mineflayer from 'mineflayer';
import { sendChat } from './main';

export class MyBot {
  bot: mineflayer.Bot | null = null;
  readonly myOptions: mineflayer.BotOptions;

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
  }

  public logIn() {
    if (!this.bot) return;
    this.bot.connect(this.myOptions);
  }

  private initEvents() {
    if (!this.bot) return;

    this.bot.on('login', () => {
      console.log('Bot logged in');
    });

    this.bot.on('spawn', () => {
      console.log(`"${this.myOptions.username}" Bot spawned`);
    });

    this.bot.on('chat', (username, message, _, raw) => {
      if (username === this.bot?.username) return;
      sendChat(message, username, raw);
    });

    this.bot.on('error', err => {
      if (err.name == 'ECONNREFUSED') {
        console.log(
          `Failed to connect to ${this.myOptions.host}:${this.myOptions.port}`
        );
        return;
      }

      console.log('Error:', err);
    });

    this.bot.on('kicked', reason => {
      console.log('Kicked:', reason);

      this.logIn();
    });
  }
}
