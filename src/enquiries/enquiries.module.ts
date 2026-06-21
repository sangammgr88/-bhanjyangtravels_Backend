import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EnquiriesService } from './enquiries.service';
import { EnquiriesController } from './enquiries.controller';
import { CommonModule } from '../common/common.module';
import { Enquiry, EnquirySchema } from './schemas/enquiry.schema';

@Module({
  imports: [
    CommonModule,
    MongooseModule.forFeature([{ name: Enquiry.name, schema: EnquirySchema }])
  ],
  controllers: [EnquiriesController],
  providers: [EnquiriesService],
  exports: [EnquiriesService],
})
export class EnquiriesModule {}