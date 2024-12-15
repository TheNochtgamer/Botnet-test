import type { BotIPCMsgChat, BotIPCMsgMeta } from '../../types';
import { MyBot } from '../MyBot';

export default class CommsService {
  private myBot;

  constructor(myBot: MyBot) {
    process.on('message', this.onMessage.bind(this));
    this.myBot = myBot;
  }

  public sendChat(message: string, username: string, raw: unknown) {
    process.send!({
      type: 'chat',
      username,
      message,
      raw
    } as BotIPCMsgChat);
  }

  private onMessage(message: BotIPCMsgMeta) {
    if (message.type !== 'meta') return;

    if (message.data.type === 'botnetUser') {
      if (message.data.action === 'remove') {
        this.myBot.botNetUsernames.delete(message.data.name);
      } else if (message.data.action === 'add') {
        console.log('Adding botnet user:', message.data.name);
        this.myBot.botNetUsernames.add(message.data.name);
      }
    }
  }
}
