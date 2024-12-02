import type { BotIPCMsgChat } from '../types';
import { MyBot } from './MyBot';

if (
  process.argv[2] === undefined ||
  process.argv[3] === undefined ||
  process.argv[4] === undefined
) {
  console.error('Missing arguments, like id or index or username');
  process.exit(1);
}

export const myID = parseInt(process.argv[2]);
export const myIndex = parseInt(process.argv[3]);
const username = process.argv[4];

(function ReBuildLogs() {
  const oldLog = console.log;
  console.log = (...args: unknown[]) => {
    oldLog(`<C><LOG:@${myIndex}> `, ...args);
  };
  const oldWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    oldWarn(`<C><WARN:@${myIndex}> `, ...args);
  };
  const oldError = console.error;
  console.error = (...args: unknown[]) => {
    oldError(`<C><ERROR:@${myIndex}> `, ...args);
  };
})();

const bot = new MyBot({
  host: process.env.MCHOST,
  port: 25565,
  username,
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
  } satisfies BotIPCMsgChat);
};

process.on('message', (msg: unknown) => {});

// export const sendLog = (args: unknown[]) => {
//   const parseMessage = {
//     type: 'log',
//     message: args
//   } satisfies BotMessageLog;

//   process.send!(parseMessage);
// };
