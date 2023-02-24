import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './api/auth/auth.guard';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getRoot() {
    return this.appService.getRoot();
  }
}
