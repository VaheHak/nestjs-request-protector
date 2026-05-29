import {
  DynamicModule,
  FactoryProvider,
  Global,
  Module,
  ModuleMetadata,
  ValueProvider,
} from '@nestjs/common';
import { RequestProtectorOptions } from './interfaces/request-protector-options.interface';
import { RequestProtectorGuard, REQUEST_PROTECTOR_OPTIONS } from './request-protector.guard';

export interface RequestProtectorAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (
    ...args: unknown[]
  ) => Promise<RequestProtectorOptions> | RequestProtectorOptions;
  inject?: FactoryProvider['inject'];
}

@Global()
@Module({})
export class RequestProtectorModule {
  /**
   * Register the module with a static configuration object.
   *
   * @example
   * RequestProtectorModule.forRoot({
   *   allowedClients: { browser: true },
   *   allowedPlatforms: { desktop: true },
   * })
   */
  static forRoot(options: RequestProtectorOptions): DynamicModule {
    const optionsProvider: ValueProvider = {
      provide: REQUEST_PROTECTOR_OPTIONS,
      useValue: options,
    };

    return {
      module: RequestProtectorModule,
      providers: [optionsProvider, RequestProtectorGuard],
      exports: [REQUEST_PROTECTOR_OPTIONS, RequestProtectorGuard],
    };
  }

  /**
   * Register the module with an async factory – useful when options depend on
   * values resolved at runtime (e.g. `ConfigService`).
   *
   * @example
   * RequestProtectorModule.forRootAsync({
   *   imports: [ConfigModule],
   *   inject: [ConfigService],
   *   useFactory: (config: ConfigService) => ({
   *     allowedClients: config.get('ALLOWED_CLIENTS'),
   *   }),
   * })
   */
  static forRootAsync(asyncOptions: RequestProtectorAsyncOptions): DynamicModule {
    const optionsProvider: FactoryProvider = {
      provide: REQUEST_PROTECTOR_OPTIONS,
      useFactory: asyncOptions.useFactory,
      inject: asyncOptions.inject ?? [],
    };

    return {
      module: RequestProtectorModule,
      imports: asyncOptions.imports ?? [],
      providers: [optionsProvider, RequestProtectorGuard],
      exports: [REQUEST_PROTECTOR_OPTIONS, RequestProtectorGuard],
    };
  }
}
