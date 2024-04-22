import {
  Controller,
  HttpException,
  HttpStatus,
  HttpCode,
  UseGuards,
  Param,
  Put,
  Query,
  Body,
  Get,
  Delete,
} from '@nestjs/common';
import { UserService as UserServices } from './user.service';
import { CheckAuthGuard, isAdmin } from 'src/Guard/permission';
import type { UserInfo } from './user.interface';

@Controller('user')
@UseGuards(CheckAuthGuard)
export class UserAdminController {
  constructor(private readonly UserService: UserServices) {}

  // 根据UID获取
  @Get('info/:uid')
  @UseGuards(isAdmin)
  @HttpCode(200)
  info_(@Param('uid') uid: string) {
    return this.UserService.info_(uid);
  }

  // 用户列表
  @Get('list')
  @UseGuards(isAdmin)
  @HttpCode(200)
  list(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('sortBy') sortBy: string,
    @Query('sortDesc') sortDesc: string,
    @Query('search') search: string,
  ) {
    if (!page || !pageSize)
      throw new HttpException(
        {
          msg: '参数有误',
        },
        HttpStatus.EXPECTATION_FAILED,
      );
    return this.UserService.list(page, pageSize, sortBy, sortDesc, search);
  }

  // 更新指定用户信息
  @Put('')
  @UseGuards(isAdmin)
  @HttpCode(200)
  update_(@Body() body: UserInfo) {
    return this.UserService.update_(body);
  }

  // 删除用户
  @Delete('')
  @UseGuards(isAdmin)
  @HttpCode(200)
  delete(@Body() body: UserInfo) {
    return this.UserService.delete(body);
  }
}
