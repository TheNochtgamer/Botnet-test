import { ChildProcess } from 'node:child_process';

export interface BotExec {
  id: number;
  child: ChildProcess;
  username: string;
}

export interface BotMessageToAll {
  type: 'all';
  message: string;
}

export interface BotMessageLog {
  type: 'log';
  message: unknown;
}

export interface BotMessageChat {
  type: 'chat';
  username: string;
  message: string;
  raw: unknown;
}

export type BotMessage = BotMessageChat | BotMessageLog | BotMessageToAll;
