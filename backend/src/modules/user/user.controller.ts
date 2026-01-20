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
import { CheckAuthGuard } from 'src/guards/permission';
import type { UpdateType } from './user.interface';
import { DeleteWanDto, LoginLogDto, VerifyRegistrationDto } from './user.dto';

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
    @Body() body: any,
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
    @Body() body: VerifyRegistrationDto,
  ) {
    return this.UserService.vRegOpt(session, body);
  }

  // 删除 WebAuthn
  @Delete('deleteRegistration')
  @HttpCode(200)
  delete_wan(
    @Session() session: Record<string, any>,
    @Body() body: DeleteWanDto,
  ) {
    return this.UserService.delete_wan(session, false, body);
  }

  // 登录日志
  @Get('loginLogs')
  @HttpCode(200)
  loginLog(
    @Session() session: Record<string, any>,
    @Query() query: LoginLogDto,
  ) {
    return this.UserService.loginLog(session, query);
  }
}
