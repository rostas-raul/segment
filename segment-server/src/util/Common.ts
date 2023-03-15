import { Settings } from '@/main';

export function splitStringNth(
  str: string,
  separator: string,
  nth: number,
): string[] {
  const parts = str.split(separator);
  return [
    parts.slice(0, nth).join(separator),
    parts.slice(nth).join(separator),
  ];
}

export function usernameToId(username: string, origin?: string) {
  return `${username}@${origin || Settings.server.hostname}`;
}
