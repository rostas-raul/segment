import { readFileSync } from 'fs';
import * as rsa from 'node-rsa';

export const accessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2M2UzYmJjM2Y2NjFiZDM2ZTMxZGE2MTMiLCJ1c2VybmFtZSI6IlRlc3QiLCJkZXZpY2UiOiIxZWJhOWYyNS1iNjZiLTQ0MzUtYWJkZS1jNTFkMGUyZGUxZjEiLCJpYXQiOjE2NzU4Njk1NjYsImV4cCI6MTY3NjQ3NDM2Nn0.o2JMLgUH-A8qthc_k9XsNH1ALC72Sne4Y75ezf3uFIM';

export const baseUrl = 'http://localhost:8080/';

export const privateKey = new rsa({ b: 1024 }).importKey(
  readFileSync('./private'),
  'private',
);
export const publicKey = new rsa({ b: 1024 }).importKey(
  readFileSync('./public'),
  'public',
);
