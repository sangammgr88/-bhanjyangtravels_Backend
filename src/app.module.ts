import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { EnquiriesModule } from './enquiries/enquiries.module';
import { TreksModule } from './treks/treks.module';
import { UploadModule } from './upload/upload.module';
import { ContactsModule } from './contacts/contacts.module';
import { BlogsModule } from './blogs/blogs.module';
import { SiteVideosModule } from './site-videos/site-videos.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CommonModule,
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.DATABASE_URL,
      }),
    }),
    AuthModule,
    UsersModule,
    EnquiriesModule,
    TreksModule,
    UploadModule,
    ContactsModule,
    BlogsModule,
    SiteVideosModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule { }
