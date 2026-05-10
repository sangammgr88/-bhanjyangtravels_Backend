import { Module } from '@nestjs/common';
import { TreksService } from './treks.service';
import { TreksController } from './treks.controller';

@Module({
  controllers: [TreksController],
  providers: [TreksService],
  exports: [TreksService],
})
export class TreksModule {} 