import { DynamicModule, Global, Module } from '@nestjs/common';
import { RequestProtectorOptions } from './interfaces/request-protector-options.interface';
import { RequestProtectorGuard } from './request-protector.guard';

@Global()
@Module({})
export class RequestProtectorModule {
  static forRoot(options: RequestProtectorOptions): DynamicModule {
    return {
      module: RequestProtectorModule,
      providers: [
        {
          provide: 'REQUEST_PROTECTOR_OPTIONS',
          useValue: options,
        },
        RequestProtectorGuard,
      ],
      exports: ['REQUEST_PROTECTOR_OPTIONS', RequestProtectorGuard],
    };
  }
}
