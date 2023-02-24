import { Injectable } from '@nestjs/common';
import { ApiResponse, CreateApiResponse, MiscMessages } from './schema/dto/Api';
import { version } from '../package.json';

@Injectable()
export class AppService {
  /** Expose important informatin about the segment service. */
  getRoot(): ApiResponse<{ version: string }> {
    return CreateApiResponse({
      status: 'OK',
      message: MiscMessages.HelloWorld,
      data: {
        version,
      },
    });
  }
}
