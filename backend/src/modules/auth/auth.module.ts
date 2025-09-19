import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailerService } from 'src/Service/mailer';

@Module({
  controllers: [AuthController],
  providers: [AuthService, MailerService],
})
export class AuthModule {}
