import { Module } from '@nestjs/common';
import { Oauth2Controller } from './oauth2.controller';
import { Oauth2Service } from './oauth2.service';

@Module({
  controllers: [Oauth2Controller],
  providers: [Oauth2Service]
})
export class Oauth2Module {}
