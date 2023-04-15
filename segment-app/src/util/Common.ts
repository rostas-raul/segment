import { useAuthStore, useLocalStore } from '@/store/store';

export function parseUserId(userId: string): {
  name: string;
  host: string;
} {
  const split = userId.split('@');

  return {
    name: split[0],
    host: split[1],
  };
}

export function localUserId() {
  const authStore = useAuthStore();
  return authStore.username;
}

export function toUserId(name: string, host: string) {
  return `${name}@${host}`;
}

export function profilePictureColors(username: string): {
  background: [string, string];
} {
  const variant = username.length % 5;

  switch (variant) {
    // red
    case 0:
      return {
        background: ['#b33c31', '#9d3127'],
      };
    // green
    case 1:
      return {
        background: ['#6fa669', '#4d8b47'],
      };
    // yellow
    case 2:
      return {
        background: ['#ccb859', '#a5923a'],
      };
    // blue
    case 3:
      return {
        background: ['#323f5f', '#232f4d'],
      };
    // purple
    case 4:
      return {
        background: ['#7334aa', '#622597'],
      };
    // red
    default:
      return {
        background: ['#b33c31', '#9d3127'],
      };
  }
}
