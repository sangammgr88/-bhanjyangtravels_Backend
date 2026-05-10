import { Module, Global } from '@nestjs/common';
import { ResponseFormatterService } from './services/response-formatter.service';
import { ResponseFormatterInterceptor } from './interceptors/response-formatter.interceptor';

@Global()
@Module({
  providers: [ResponseFormatterService, ResponseFormatterInterceptor],
  exports: [ResponseFormatterService, ResponseFormatterInterceptor],
})
export class CommonModule {} 