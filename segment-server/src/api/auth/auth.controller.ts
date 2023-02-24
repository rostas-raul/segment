import { Body, Controller, Post } from '@nestjs/common';
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
}
