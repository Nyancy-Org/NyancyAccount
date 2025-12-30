import {
  Controller,
  HttpCode,
  UseGuards,
  Param,
  Put,
  Query,
  Body,
  Get,
  Delete,
} from '@nestjs/common';
import { CheckAuthGuard, isAdmin } from 'src/guards/permission';
import { UserController } from './user.controller';
import {
  DeleteUserAdminDto,
  LoginLogDto,
  UpdateUserAdminDto,
  UserListDto,
} from './user.dto';

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
  list(@Query() query: UserListDto) {
    return this.UserAdminService.list(
      query.page,
      query.pageSize,
      query.sortBy,
      query.sortDesc,
      query.search,
    );
  }

  // 更新指定用户信息
  @Put('')
  @HttpCode(200)
  update_(@Body() body: UpdateUserAdminDto) {
    return this.UserAdminService.update_(body);
  }

  // 删除用户
  @Delete('')
  @HttpCode(200)
  delete(@Body() body: DeleteUserAdminDto) {
    return this.UserAdminService.delete(body);
  }

  // 所有用户登录日志
  @Get('admin/loginLogs')
  @HttpCode(200)
  _loginLog(@Query() query: LoginLogDto) {
    return this.UserAdminService.adminLoginLog(query);
  }
}
