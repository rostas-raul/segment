import { argon2id } from 'argon2';
import { createHash } from 'crypto';

export const CommonArgonConfiguration = {
  type: argon2id,
  timeCost: 5,
  memoryCost: 64 * 1024,
  parallelism: 2,
  hashLength: 32,
  saltLength: 16,
};

export function sha256(data: string) {
  return createHash('sha256').update(data).digest('base64');
}
