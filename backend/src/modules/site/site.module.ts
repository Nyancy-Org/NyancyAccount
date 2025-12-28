import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { SiteController } from './site.controller';
import { SiteService } from './site.service';
import { AuthService } from 'src/modules/auth/auth.service';
import { Site } from 'src/entities/Site';
import { User } from 'src/entities/User';
import { OauthClient } from 'src/entities/OauthClient';
import { DailyStatistic } from 'src/entities/DailyStatistic';

@Module({
  imports: [
    MikroOrmModule.forFeature([Site, User, OauthClient, DailyStatistic]),
  ],
  controllers: [SiteController],
  providers: [SiteService, AuthService],
})
export class SiteModule {}
