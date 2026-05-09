import { plainToClass } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'dev',
  Production = 'prod',
  Test = 'test',
}

class EnvironmentVariables {
  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number;

  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsOptional()
  @IsString()
  MONGO_URI?: string;

  @IsOptional()
  @IsString()
  MONGO_DB_NAME?: string;
}

export function validateConfig(configuration: Record<string, unknown>) {
  const configClass = plainToClass(EnvironmentVariables, configuration, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(configClass, { skipMissingProperties: false });

  for (const err of errors) {
    Object.values(err.constraints).map((str) => {
      console.log(str);
      console.log('-----------------------');
    });
  }

  if (errors.length) {
    throw new Error('Error during the environment variables reading');
  }

  return configClass;
}
