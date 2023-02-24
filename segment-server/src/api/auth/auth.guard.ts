import { CommonMessages, CreateApiResponse } from '@/schema/dto/Api';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException(
          CreateApiResponse({
            status: 'FAIL',
            message: CommonMessages.Unauthorized,
          }),
        )
      );
    }

    return super.handleRequest(err, user, info, context, status);
  }
}
