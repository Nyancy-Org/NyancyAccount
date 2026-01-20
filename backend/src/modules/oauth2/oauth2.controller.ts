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
  ParseIntPipe,
} from '@nestjs/common';
import { Oauth2Service as Oauth2Services } from './oauth2.service';
import { CheckAuthGuard, isAdmin } from 'src/guards/permission';
import {
  OauthBodyDto,
  NewOauthClientDto,
  OauthClientIdDto,
  AdminEditOauthClientDto,
  AuthorizeDto,
  GetClientsDto,
  EditOauthClientDto,
} from './oauth2.dto';

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

  // 生成授权 Code
  @Post('authorize')
  @UseGuards(CheckAuthGuard)
  @HttpCode(200)
  async authorize(
    @Session() session: Record<string, any>,
    @Query() query: AuthorizeDto,
  ) {
    const { client_id, redirect_uri, response_type, scope, state } = query;
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
    @Body() body: OauthBodyDto,
  ) {
    return await this.Oauth2Service.getToken(session, body);
  }

  // 根据 Token 查询用户信息
  @Options('user')
  @HttpCode(200)
  return200() {
    return {
      msg: 'ok',
    };
  }

  @Get('user')
  @HttpCode(200)
  async getUserInfo(
    @Session() session: Record<string, any>,
    @Headers('authorization') authorization: string,
    // @Body() body: OauthBodyDto,
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
    @Body() body: NewOauthClientDto,
  ) {
    return await this.Oauth2Service.createClient(session, body);
  }

  // 编辑oauth2应用
  @Put('user/client')
  @UseGuards(CheckAuthGuard)
  @HttpCode(200)
  async editClient(
    @Session() session: Record<string, any>,
    @Body() body: EditOauthClientDto,
  ) {
    return await this.Oauth2Service.editMyClient(session, body);
  }

  // 删除oauth2应用
  @Delete('user/client')
  @UseGuards(CheckAuthGuard)
  @HttpCode(200)
  async delClient(
    @Session() session: Record<string, any>,
    @Body() body: OauthClientIdDto,
  ) {
    return await this.Oauth2Service.delMyClient(session, body);
  }

  // 重置oauth2应用密钥
  @Put('user/client/reset/:id')
  @UseGuards(CheckAuthGuard)
  @HttpCode(200)
  async resetKey(
    @Session() session: Record<string, any>,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.Oauth2Service.resetSecret(session, id);
  }

  /**
   * 管理员接口
   */
  // 查看所有oauth2应用
  @Get('admin/clients')
  @UseGuards(CheckAuthGuard)
  @UseGuards(isAdmin)
  @HttpCode(200)
  async clients(@Query() query: GetClientsDto) {
    return await this.Oauth2Service.allClients(
      query.page,
      query.pageSize,
      query.sortBy,
      query.sortDesc,
      query.search,
    );
  }

  // 编辑指定oauth2应用
  @Put('admin/client')
  @UseGuards(CheckAuthGuard)
  @UseGuards(isAdmin)
  @HttpCode(200)
  async _editClient(@Body() body: AdminEditOauthClientDto) {
    return await this.Oauth2Service.editClient(body);
  }

  // 删除指定oauth2应用
  @Delete('admin/client')
  @UseGuards(CheckAuthGuard)
  @UseGuards(isAdmin)
  @HttpCode(200)
  async _delClient(@Body() body: OauthClientIdDto) {
    return await this.Oauth2Service.deleteClient(body);
  }
}
