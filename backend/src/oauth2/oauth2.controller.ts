import {
  Controller,
  HttpCode,
  UseGuards,
  Headers,
  Session,
  Query,
  Param,
  Put,
  Post,
  Body,
  Get,
  Delete,
  Options,
} from '@nestjs/common';
import { Oauth2Service as Oauth2Services } from './oauth2.service';
import { CheckAuthGuard, isAdmin } from 'src/Guard/permission';
import type {
  OauthBody,
  NewOauthClient,
  EditOauthClient,
  AdminEditOauthClient,
} from './oauth2.interface';

@Controller('oauth2')
export class Oauth2Controller {
  constructor(private readonly Oauth2Service: Oauth2Services) {}

  // 获取应用信息（用于前端信息展示）
  @Get('client/:client_id')
  @UseGuards(CheckAuthGuard)
  @HttpCode(200)
  async clientInfo(@Param('client_id') clientId: string) {
    return await this.Oauth2Service.clientInfo(clientId);
  }

  // 获取授权 Code
  @Post('authorize')
  @UseGuards(CheckAuthGuard)
  @HttpCode(200)
  async authorize(
    @Session() session: Record<string, any>,
    @Query('client_id') client_id: string,
    @Query('redirect_uri') redirect_uri: string,
    @Query('response_type') response_type: string,
    @Query('scope') scope: string,
    @Query('state') state: string,
  ) {
    return await this.Oauth2Service.authorize(
      session,
      client_id,
      redirect_uri,
      response_type,
      scope,
      state,
    );
  }

  // 验证 Code，返回授权 Token
  @Post('token')
  @HttpCode(200)
  async getToken(
    @Session() session: Record<string, any>,
    @Body() body: OauthBody,
  ) {
    return await this.Oauth2Service.getToken(session, body);
  }

  // 根据 Token 查询用户信息
  @Options('user')
  @HttpCode(200)
  return200() {
    return {
      code: 200,
      msg: 'ok',
    };
  }

  @Get('user')
  @HttpCode(200)
  async getUserInfo(
    @Session() session: Record<string, any>,
    @Headers('authorization') authorization: string,
    // @Body() body: OauthBody,
  ) {
    return await this.Oauth2Service.userInfo(session, authorization);
  }

  /**
   * 个人用户
   */
  // 获取自己创建的oauth2应用
  @Get('user/clients')
  @UseGuards(CheckAuthGuard)
  @HttpCode(200)
  async userClients(@Session() session: Record<string, any>) {
    return await this.Oauth2Service.myClients(session);
  }

  // 新建一个oauth2应用
  @Post('user/client')
  @UseGuards(CheckAuthGuard)
  @HttpCode(200)
  async createClient(
    @Session() session: Record<string, any>,
    @Body() body: NewOauthClient,
  ) {
    return await this.Oauth2Service.createClient(session, body);
  }

  // 编辑oauth2应用
  @Put('user/client')
  @UseGuards(CheckAuthGuard)
  @HttpCode(200)
  async editClient(
    @Session() session: Record<string, any>,
    @Body() body: EditOauthClient,
  ) {
    return await this.Oauth2Service.editMyClient(session, body);
  }

  // 删除oauth2应用
  @Delete('user/client')
  @UseGuards(CheckAuthGuard)
  @HttpCode(200)
  async delClient(
    @Session() session: Record<string, any>,
    @Body() body: { id: number },
  ) {
    return await this.Oauth2Service.delMyClient(session, body);
  }

  /**
   * 管理员接口
   */
  // 查看所有oauth2应用
  @Get('admin/clients')
  @UseGuards(CheckAuthGuard)
  @UseGuards(isAdmin)
  @HttpCode(200)
  async clients(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('sortBy') sortBy: string,
    @Query('sortDesc') sortDesc: string,
    @Query('search') search: string,
  ) {
    return await this.Oauth2Service.allClients(
      page,
      pageSize,
      sortBy,
      sortDesc,
      search,
    );
  }

  // 编辑指定oauth2应用
  @Put('admin/client')
  @UseGuards(CheckAuthGuard)
  @UseGuards(isAdmin)
  @HttpCode(200)
  async _editClient(@Body() body: AdminEditOauthClient) {
    return await this.Oauth2Service.editClient(body);
  }

  // 删除指定oauth2应用
  @Delete('admin/client')
  @UseGuards(CheckAuthGuard)
  @UseGuards(isAdmin)
  @HttpCode(200)
  async _delClient(@Body() body: { id: number }) {
    return await this.Oauth2Service.deleteClient(body);
  }
}
