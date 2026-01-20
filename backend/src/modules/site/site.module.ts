import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { SiteController } from './site.controller';
import { SiteService } from './site.service';
import { AuthService } from '@/modules/auth/auth.service';
import { Site } from '@/entities/Site';
import { User } from '@/entities/User';
import { OauthClient } from '@/entities/OauthClient';
import { DailyStatistic } from '@/entities/DailyStatistic';

@Module({
  imports: [
    MikroOrmModule.forFeature([Site, User, OauthClient, DailyStatistic]),
  ],
  controllers: [SiteController],
  providers: [SiteService, AuthService],
})
export class SiteModule {}
