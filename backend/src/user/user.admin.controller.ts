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
import { CheckAuthGuard, isAdmin } from 'src/Guard/permission';
import type { UserInfo } from './user.interface';
import { UserController } from './user.controller';

@Controller('user')
@UseGuards(CheckAuthGuard)
@UseGuards(isAdmin)
export class UserAdminController extends UserController {
  // 根据UID获取
  @Get('info/:uid')
  @HttpCode(200)
  info_(@Param('uid') uid: string) {
    return this.UserService.info_(uid);
  }

  // 用户列表
  @Get('list')
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
    return this.UserAdminService.list(page, pageSize, sortBy, sortDesc, search);
  }

  // 更新指定用户信息
  @Put('')
  @HttpCode(200)
  update_(@Body() body: UserInfo) {
    return this.UserAdminService.update_(body);
  }

  // 删除用户
  @Delete('')
  @HttpCode(200)
  delete(@Body() body: UserInfo) {
    return this.UserAdminService.delete(body);
  }

  // 所有用户登录日志
  @Get('admin/loginLogs')
  @HttpCode(200)
  _loginLog(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
    @Query('sortBy') sortBy: string,
    @Query('sortDesc') sortDesc: string,
    @Query('search') search: string,
  ) {
    return this.UserAdminService.adminLoginLog(
      page,
      pageSize,
      sortBy,
      sortDesc,
      search,
    );
  }
}
