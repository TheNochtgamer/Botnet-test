import type { BotMessageChat, BotMessageLog } from '../types';
import { MyBot } from './MyBot';

if (process.argv[2] === undefined || process.argv[3] === undefined) {
  console.error('Missing arguments, like id or username');
  process.exit(1);
}

export const myID = parseInt(process.argv[2]);

(function ReBuildLogs() {
  const oldLog = console.log;
  console.log = (...args: unknown[]) => {
    oldLog(`<C><LOG:#${myID}> `, ...args);
  };
  const oldWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    oldWarn(`<C><WARN:#${myID}> `, ...args);
  };
  const oldError = console.error;
  console.error = (...args: unknown[]) => {
    oldError(`<C><ERROR:#${myID}> `, ...args);
  };
})();

const bot = new MyBot({
  host: process.env.MCHOST,
  port: 25565,
  username: process.argv[3],
  auth: 'offline',
  viewDistance: 'tiny'
});
bot.init();

export const sendChat = (message: string, username: string, raw: unknown) => {
  process.send!({
    type: 'chat',
    username,
    message,
    raw
  } satisfies BotMessageChat);
};

// export const sendLog = (args: unknown[]) => {
//   const parseMessage = {
//     type: 'log',
//     message: args
//   } satisfies BotMessageLog;

//   process.send!(parseMessage);
// };
