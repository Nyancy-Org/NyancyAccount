import { ERR_UNSUPPORTED_DATA_TYPE } from '@/types/const';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsIn,
  MaxLength,
  Max,
  IsBoolean,
} from 'class-validator';
import { OauthClient } from '@/entities/OauthClient';
import { IntersectionType } from '@nestjs/mapped-types';

export class OauthBodyDto {
  @IsNotEmpty({ message: ERR_UNSUPPORTED_DATA_TYPE })
  @IsString({ message: ERR_UNSUPPORTED_DATA_TYPE })
  grant_type: string;

  @IsNotEmpty({ message: '请填写客户端ID' })
  @IsInt({ message: ERR_UNSUPPORTED_DATA_TYPE })
  @Type(() => Number)
  client_id: number;

  @IsNotEmpty({ message: '请填写客户端密钥' })
  @IsString({ message: ERR_UNSUPPORTED_DATA_TYPE })
  client_secret: string;

  @IsNotEmpty({ message: '请填写回调地址' })
  @IsString({ message: ERR_UNSUPPORTED_DATA_TYPE })
  redirect_uri: string;

  @IsNotEmpty({ message: '无效的授权码' })
  @IsString({ message: ERR_UNSUPPORTED_DATA_TYPE })
  code: string;
}

export class OauthClientIdDto {
  @IsNotEmpty({ message: 'ID 不能为空' })
  // TODO: 动态限制个数
  @Max(999999999, { message: 'ID 过长！' })
  @IsInt({ message: ERR_UNSUPPORTED_DATA_TYPE })
  id: number;
}

export class NewOauthClientDto {
  @IsNotEmpty({ message: '请填写应用名' })
  @MaxLength(32, { message: '应用名过长！' })
  @IsString({ message: ERR_UNSUPPORTED_DATA_TYPE })
  name: string;

  @IsNotEmpty({ message: '请填写回调地址' })
  @MaxLength(32, { message: '回调地址过长！' })
  @IsString({ message: ERR_UNSUPPORTED_DATA_TYPE })
  redirect: string;
}

export class EditOauthClientDto extends IntersectionType(
  OauthClientIdDto,
  NewOauthClientDto,
) {}

export class AdminEditOauthClientDto extends EditOauthClientDto {
  @IsNotEmpty({ message: '请填写客户端密钥' })
  @IsString({ message: ERR_UNSUPPORTED_DATA_TYPE })
  secret: string;

  @IsNotEmpty({ message: '请填写所属用户ID' })
  @IsInt({ message: ERR_UNSUPPORTED_DATA_TYPE })
  userId: number;
}

export class AuthorizeDto {
  @IsNotEmpty({ message: '请填写客户端ID' })
  @IsString({ message: ERR_UNSUPPORTED_DATA_TYPE })
  client_id: string;

  @IsNotEmpty({ message: '请填写回调地址' })
  @IsString({ message: ERR_UNSUPPORTED_DATA_TYPE })
  redirect_uri: string;

  @IsNotEmpty({ message: '不支持的响应类型' })
  @IsString({
    message: ERR_UNSUPPORTED_DATA_TYPE,
  })
  @IsIn(['code'], { message: '不支持的响应类型' })
  response_type: string;

  // TODO: test 允许为空，但如果有值则必须是字符串
  @IsOptional()
  @IsString({ message: ERR_UNSUPPORTED_DATA_TYPE })
  scope: string;

  @IsOptional()
  @IsString({ message: ERR_UNSUPPORTED_DATA_TYPE })
  state: string;
}

export class GetClientsDto {
  @IsNotEmpty()
  @IsInt({ message: ERR_UNSUPPORTED_DATA_TYPE })
  @Type(() => Number)
  page: number = 1;

  @IsNotEmpty()
  @IsInt({ message: ERR_UNSUPPORTED_DATA_TYPE })
  @Type(() => Number)
  pageSize: number = 10;

  @IsOptional()
  @IsIn([
    'id',
    'userId',
    'name',
    'secret',
    'redirect',
    'createdAt',
    'updatedAt',
  ])
  sortBy?: keyof OauthClient;

  @IsOptional()
  @IsBoolean({ message: ERR_UNSUPPORTED_DATA_TYPE })
  @Type(() => Boolean)
  sortDesc: boolean = false;

  @IsOptional()
  @IsString({ message: ERR_UNSUPPORTED_DATA_TYPE })
  search?: string;
}
