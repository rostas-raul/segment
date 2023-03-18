import { sha256 } from '../src/util/Crypto';
import axios from 'axios';
import { accessToken, baseUrl, privateKey } from './common';

const roomId = 'c80a0b72-a467-4205-9f70-2c52a4c6ca16';
const content = 'Hello, World!';

axios
  .post(
    `${baseUrl}client/rooms/${roomId}/messages`,
    {
      body: {
        content,
        signature: privateKey.sign(sha256(content), 'base64'),
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )
  .then((res) => {
    console.log(res.data);
  });
