import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Req() req: any): string {
    console.log('dfkfkfk');
    return JSON.stringify(req['user']);
  }
}
