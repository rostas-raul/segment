import { randomUUID } from 'crypto';

export function randomString(length: number) {
  return randomUUID();
}
