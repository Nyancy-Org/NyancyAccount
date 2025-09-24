import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export const EMAIL_REG =
  /^([a-zA-Z0-9_.+-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z]{2,6})$/;
export const UNAME_REG = /^[a-zA-Z0-9_-]{4,16}$/;

// 6-20位字符,允许英文字母、数字和特殊字符
export const PWD_REG = /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{}|\\:;"'<>,.?/~`]{6,20}$/;

export class LoginDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名不符合规范' })
  @MinLength(4, { message: '用户名长度不能小于 4 个字符' })
  @MaxLength(128, { message: '用户名长度不能超过 128 个字符' })
  username: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码不符合规范' })
  @MinLength(6, { message: '密码长度不能小于 6 个字符' })
  @MaxLength(20, { message: '密码长度不能超过 20 个字符' })
  @Matches(PWD_REG, {
    message: '密码不符合规范',
  })
  password: string;
}

export class RegisterDto extends LoginDto {
  @IsNotEmpty({ message: '验证码不能为空' })
  @IsString({ message: '验证码不符合规范' })
  code: string;

  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsString({ message: '邮箱不符合规范' })
  @Matches(EMAIL_REG, {
    message: '邮箱不符合规范',
  })
  email: string;
}
