import {
  Controller,
  HttpException,
  HttpStatus,
  HttpCode,
  UseGuards,
  Session,
  Param,
  Put,
  Query,
  Body,
  Get,
  Delete,
  Post,
} from '@nestjs/common';
import { UserService as UserServices } from './user.service';
import { CheckAuthGuard, isAdmin } from 'src/Guard/permission';
import type { UserInfo, UpdateType } from './user.interface';
import type { RegistrationResponseJSON } from '@simplewebauthn/types';

@Controller('user')
@UseGuards(CheckAuthGuard)
export class UserController {
  constructor(private readonly UserService: UserServices) {}

  // 用户信息
  @Get('info')
  @HttpCode(200)
  info(@Session() session: Record<string, any>) {
    return this.UserService.info(session);
  }

  // 更新用户信息
  @Put('update/:type')
  @HttpCode(200)
  update(
    @Session() session: Record<string, any>,
    @Param('type') type: UpdateType,
    @Body() body: { [propName: string]: unknown },
  ) {
    return this.UserService.update(session, type, body);
  }

  // 生成 WebAuthn 配置项
  @Get('registrationOptions')
  @HttpCode(200)
  genRegOpt(@Session() session: Record<string, any>) {
    return this.UserService.genRegOpt(session);
  }

  // 验证 WebAuthn 配置项
  @Post('verifyRegistration')
  @HttpCode(200)
  vRegOpt(
    @Session() session: Record<string, any>,
    @Body() body: RegistrationResponseJSON,
  ) {
    return this.UserService.vRegOpt(session, body);
  }

  // 删除 WebAuthn
  @Delete('deleteRegistration')
  @HttpCode(200)
  delete_wan(
    @Session() session: Record<string, any>,
    @Body() body: { credentialID: string },
  ) {
    return this.UserService.delete_wan(session, false, body);
  }

  /**
   * 管理员接口
   */
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
