import { ChildProcess } from 'node:child_process';
import { Vec3 } from 'vec3';

export interface BotExec {
  id: number;
  child: ChildProcess;
  username: string;
  botIndex: number;
}

export interface BotIPCMsgToAll {
  type: 'all';
  message: string;
}

export interface BotIPCMsgLog {
  type: 'log';
  message: unknown;
}

export interface BotIPCMsgMetaEntity {
  type: 'entity';
  name: string;
  id: number;
  pos: Vec3;
}

export interface BotIPCMsgMeta {
  type: 'meta';
  data: BotIPCMsgMetaEntity;
}

export interface BotIPCMsgChat {
  type: 'chat';
  username: string;
  message: string;
  raw: unknown;
}

export type BotIPCMsg =
  | BotIPCMsgChat
  | BotIPCMsgLog
  | BotIPCMsgToAll
  | BotIPCMsgMeta;
