import { BotCommand } from '../bottypes';

export default {
  name: 'help',
  match: new RegExp('^help$'),
  run: async (bot, sender, message) => {
    bot.sendChat('This is the help command', sender, message);
  }
} satisfies BotCommand;
