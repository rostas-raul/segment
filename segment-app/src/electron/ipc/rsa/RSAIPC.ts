import { ipcMain } from 'electron';
import { IPCEvents } from '../IPC';
import rsa from 'node-rsa';
import { createHash } from 'crypto';

export function registerRSAIPC() {
  ipcMain.on(IPCEvents.GenerateRSAKeyPair, (e, args) => {
    const keypair = new rsa({ b: 1024 });
    e.returnValue = {
      public: keypair.exportKey('public'),
      private: keypair.exportKey('private'),
    };
  });

  ipcMain.on(IPCEvents.SignDataRSA, (e, ...args: [string, string]) => {
    const keypair = new rsa().importKey(args[0]);
    const data = createHash('sha256').update(args[1]).digest('base64');

    e.returnValue = keypair.sign(data, 'base64');
  });
}
