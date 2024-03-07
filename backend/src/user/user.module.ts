import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthService } from 'src/auth/auth.service';

@Module({
  controllers: [UserController],
  providers: [UserService, AuthService],
})
export class UserModule {}
