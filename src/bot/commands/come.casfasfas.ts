import { BotCommand } from '../botTypes';

export default {
  name: 'come',
  aliases: ['aca', 'veni', 'aqui', 'here', 'x'],
  run: async (myBot, sender, args, raw) => {
    myBot.bot?.version;
  }
} satisfies BotCommand;
