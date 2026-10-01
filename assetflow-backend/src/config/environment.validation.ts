import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 4000;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  CORS_ORIGIN: string = 'http://localhost:3000';

  /** Signs access tokens. Long and random; never commit the real value. */
  @IsString()
  @MinLength(32)
  JWT_ACCESS_SECRET!: string;

  /** Signs refresh tokens. Must differ from the access secret. */
  @IsString()
  @MinLength(32)
  JWT_REFRESH_SECRET!: string;

  @IsInt()
  @Min(60)
  JWT_ACCESS_TTL_SECONDS: number = 900; // 15 minutes

  @IsInt()
  @Min(300)
  JWT_REFRESH_TTL_SECONDS: number = 604800; // 7 days
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true, // "4000" -> 4000
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const messages = errors
      .map((e) => Object.values(e.constraints ?? {}).join(', '))
      .join('\n');
    throw new Error(`❌ Invalid environment variables:\n${messages}`);
  }

  if (validatedConfig.JWT_ACCESS_SECRET === validatedConfig.JWT_REFRESH_SECRET) {
    throw new Error('❌ JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different.');
  }

  return validatedConfig;
}
