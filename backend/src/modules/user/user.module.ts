import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserAdminController } from './user.admin.controller';
import { UserAdminService } from './user.admin.service';
import { AuthService } from 'src/modules/auth/auth.service';

@Module({
  controllers: [UserController, UserAdminController],
  providers: [UserService, UserAdminService, AuthService],
})
export class UserModule {}
