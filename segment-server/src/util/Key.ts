import config from '@/config';
import { Settings } from '@/main';
import * as rsa from 'node-rsa';

export function getServerPublicKey() {
  return new rsa({ b: Settings.server.keySize }).importKey(
    config.keys.public,
    'public',
  );
}

export function getServerPrivateKey() {
  return new rsa({ b: Settings.server.keySize }).importKey(
    config.keys.private,
    'private',
  );
}

export function importKey(key: string, type: 'public' | 'private' = 'public') {
  return new rsa().importKey(key, type);
}
