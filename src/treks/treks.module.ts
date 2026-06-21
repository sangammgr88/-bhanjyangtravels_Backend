import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TreksService } from './treks.service';
import { TreksController } from './treks.controller';
import { Trek, TrekSchema } from './schemas/trek.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Trek.name, schema: TrekSchema }]),
  ],
  controllers: [TreksController],
  providers: [TreksService],
  exports: [TreksService],
})
export class TreksModule {}