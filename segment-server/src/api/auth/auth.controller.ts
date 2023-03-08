import { User } from '@/decorators/user.decorator';
import { UserToken } from '@/schema/dto/User';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { LoginUserDto, RegisterUserDto } from './auth.validation';

@Controller('/client/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  public register(@Body() registerUser: RegisterUserDto) {
    return this.authService.register(
      registerUser.username,
      registerUser.password,
    );
  }

  @Post('login')
  public login(@Body() loginUser: LoginUserDto) {
    return this.authService.login(
      loginUser.username,
      loginUser.password,
      loginUser.deviceId,
    );
  }

  @Get('self')
  @UseGuards(JwtAuthGuard)
  public self(@User() user: UserToken) {
    return this.authService.getSelf(user);
  }
}
