import { Controller, Get, HttpCode, Post, All } from '@nestjs/common';
import { MainService as MainServices } from './main.service';

@Controller()
export class MainController {
  constructor(private readonly MainService: MainServices) {}

  @Get()
  @HttpCode(233)
  get() {
    return this.MainService.indexGet();
  }

  @Post()
  @HttpCode(500)
  post() {
    return this.MainService.indexPost();
  }

  @All()
  @HttpCode(666)
  all() {
    return this.MainService.indexAll();
  }
}
