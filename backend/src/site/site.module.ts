import { Module } from '@nestjs/common';
import { SiteController } from './site.controller';
import { SiteService } from './site.service';
import { AuthService } from 'src/auth/auth.service';

@Module({
  controllers: [SiteController],
  providers: [SiteService, AuthService],
})
export class SiteModule {}
