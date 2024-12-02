import type { Bot } from '../types';

export interface BotCommand {
  name: string;
  match: RegExp;
  run: (bot: Bot, sender: string, message: string) => void;
}
