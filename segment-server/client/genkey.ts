import { writeFileSync } from 'fs';
import * as rsa from 'node-rsa';

const keypair = new rsa({ b: 1024 });
writeFileSync('./private', keypair.exportKey('private'));
writeFileSync('./public', keypair.exportKey('public'));
