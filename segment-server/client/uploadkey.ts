import { sha256 } from '../src/util/Crypto';
import axios from 'axios';
import { accessToken, baseUrl, privateKey, publicKey } from './common';

const content = publicKey.exportKey('public');

axios
  .put(
    `${baseUrl}client/keys/upload`,
    {
      publicKey: content,
      signature: privateKey.sign(sha256(content), 'base64'),
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )
  .then((res) => {
    console.log(res);
  });
