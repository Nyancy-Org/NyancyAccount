import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserAdminController } from './user.admin.controller';
import { AuthService } from 'src/auth/auth.service';

@Module({
  controllers: [UserController, UserAdminController],
  providers: [UserService, AuthService],
})
export class UserModule {}
