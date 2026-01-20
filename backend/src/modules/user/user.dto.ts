import { ERR_UNSUPPORTED_DATA_TYPE } from '@/types/const';
import { Type, Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsIn,
  IsInt,
  IsBoolean,
  IsNotEmpty,
  IsEmail,
  ValidateNested,
  Length,
  IsObject,
} from 'class-validator';
import { User } from '@/entities/User';
import type { RegistrationResponseJSON } from '@simplewebauthn/types';

export class UserListDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  pageSize: number = 10;

  @IsOptional()
  @IsIn([
    'id',
    'username',
    'password',
    'status',
    'role',
    'email',
    'regTime',
    'apikey',
    'verifyToken',
    'authDevice',
  ])
  sortBy?: keyof User;

  @IsOptional()
  @IsBoolean({ message: ERR_UNSUPPORTED_DATA_TYPE })
  @Transform(({ value }) => value === 'true' || value === true)
  sortDesc: boolean = false;

  @IsOptional()
  @IsString({ message: ERR_UNSUPPORTED_DATA_TYPE })
  search?: string;
}

export class UpdateNameDto {
  @IsString()
  @IsNotEmpty()
  @Length(4, 16)
  username: string;
}

export class UpdateEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}

class PasswordPair {
  @IsString()
  @IsNotEmpty()
  old: string;

  @IsString()
  @IsNotEmpty()
  new: string;
}

export class UpdatePasswordDto {
  @ValidateNested()
  @Type(() => PasswordPair)
  password: PasswordPair;
}

export class UpdateApikeyDto {
  @IsString()
  @IsIn(['true', 'false'])
  apikey: string;
}

export class DeleteWanDto {
  @IsString()
  @IsNotEmpty()
  credentialID: string;
}

export class LoginLogDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  pageSize: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  sortDesc: boolean = false;

  @IsOptional()
  @IsString()
  search?: string;
}

export class UpdateUserAdminDto {
  @IsInt()
  id: number;

  @IsString()
  @IsNotEmpty()
  @Length(4, 16)
  username: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsEmail()
  email: string;

  @IsInt()
  status: number;

  @IsString()
  role: string;

  @IsOptional()
  @IsString()
  apikey?: string;
}

export class DeleteUserAdminDto {
  @IsInt()
  id: number;
}

export class VerifyRegistrationDto implements RegistrationResponseJSON {
  @IsString()
  id: string;

  @IsString()
  rawId: string;

  @IsObject()
  response: any;

  @IsOptional()
  @IsString()
  authenticatorAttachment?: 'cross-platform' | 'platform';

  @IsObject()
  clientExtensionResults: any;

  @IsString()
  type: 'public-key';
}
