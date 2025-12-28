import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailerService } from '@/services/mailer';
import { User } from '@/entities/User';
import { UserIp } from '@/entities/UserIp';
import { Site } from '@/entities/Site';
import { DailyStatistic } from '@/entities/DailyStatistic';

@Module({
  imports: [MikroOrmModule.forFeature([User, UserIp, Site, DailyStatistic])],
  controllers: [AuthController],
  providers: [AuthService, MailerService],
})
export class AuthModule {}
