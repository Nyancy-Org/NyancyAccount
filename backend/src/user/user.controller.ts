import {
  Controller,
  HttpCode,
  UseGuards,
  Session,
  Param,
  Put,
  Body,
  Get,
  Delete,
  Post,
  Query,
} from '@nestjs/common';
import { UserService as UserServices } from './user.service';
import { UserAdminService as UserAdminServices } from './user.admin.service';
import { CheckAuthGuard } from 'src/Guard/permission';
import type { UpdateType } from './user.interface';
import type { RegistrationResponseJSON } from '@simplewebauthn/types';

@Controller('user')
@UseGuards(CheckAuthGuard)
export class UserController {
  constructor(
    readonly UserService: UserServices,
    readonly UserAdminService: UserAdminServices,
  ) {}

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

  // 登录日志
  @Get('loginLogs')
  @HttpCode(200)
  loginLog(
    @Session() session: Record<string, any>,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
    @Query('sortBy') sortBy: string,
    @Query('sortDesc') sortDesc: string,
    @Query('search') search: string,
  ) {
    return this.UserService.loginLog(
      session,
      page,
      pageSize,
      sortBy,
      sortDesc,
      search,
    );
  }
}
