import { ERR_UNSUPPORTED_DATA_TYPE } from '@/types/const';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsIn, IsInt, IsBoolean } from 'class-validator';
import { User } from '@/entities/User';

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
  sortDesc: boolean = false;

  @IsOptional()
  @IsString({ message: ERR_UNSUPPORTED_DATA_TYPE })
  search?: string;
}
