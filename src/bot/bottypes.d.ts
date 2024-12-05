import type { MyBot } from './MyBot';
import { parseSync } from 'yargs';

export interface BotCommand {
  name: string;
  aliases?: string[];
  run: (
    myBot: MyBot,
    sender: string,
    args: ReturnType<typeof parseSync>,
    raw: string
  ) => void;
}
