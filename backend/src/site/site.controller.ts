import {
  Controller,
  HttpCode,
  UseGuards,
  Put,
  Body,
  Get,
} from '@nestjs/common';
import { SiteService as SiteServices } from './site.service';
import { CheckAuthGuard, isAdmin } from 'src/Guard/permission';
import { SiteOptions } from './site.interface';

@Controller('site')
@UseGuards(CheckAuthGuard)
export class SiteController {
  constructor(private readonly SiteService: SiteServices) {}

  // 获取站点配置
  @Get('info')
  @UseGuards(isAdmin)
  @HttpCode(200)
  list() {
    return this.SiteService.info();
  }

  // 修改站点配置
  @Put('')
  @UseGuards(isAdmin)
  @HttpCode(200)
  update_(@Body() body: SiteOptions) {
    return this.SiteService.update_(body);
  }

  // 获取统计数据
  @Get('statistic')
  @UseGuards(isAdmin)
  @HttpCode(200)
  updateNotice() {
    return this.SiteService.getStatistic();
  }
}
