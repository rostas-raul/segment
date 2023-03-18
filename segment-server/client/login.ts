import { ApiResponse } from '@/schema/dto/Api';
import axios from 'axios';
import { baseUrl } from './common';

const username = 'Test';
const password = 'Asdasd123';

axios
  .post<ApiResponse<{ accessToken: string }>>(`${baseUrl}client/auth/login`, {
    username,
    password,
  })
  .then((res) => {
    console.log(res.data.data.accessToken);
  });
