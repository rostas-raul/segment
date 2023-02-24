import { NestFactory } from '@nestjs/core';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import config from './config';
import * as rsa from 'node-rsa';
import { validate } from 'class-validator';
import {
  SettingsAuthValidator,
  SettingsServerValidator,
  SettingsValidator,
} from './util/Settings.validation';
import {
  ApiResponse,
  CommonMessages,
  CreateApiResponse,
} from './schema/dto/Api';

const __rootDir = join(__dirname, '..', '..');
const __keyDir = join(__rootDir, 'keys');

export const Settings: SettingsValidator = JSON.parse(
  readFileSync(join(__rootDir, 'settings.json')).toString(),
);

async function bootstrap() {
  // Validate settings
  const _settings = new SettingsValidator();
  _settings.server = new SettingsServerValidator();
  _settings.server.hostname = Settings.server.hostname;
  _settings.server.ip = Settings.server.ip;
  _settings.server.port =
    Settings.server.port || parseInt(process.env.PORT) || 3000;
  _settings.server.keySize = Settings.server.keySize || 2048;
  _settings.auth = new SettingsAuthValidator();
  _settings.auth.allowRegistration = Settings.auth.allowRegistration;
  validate(_settings).then((err) => {
    if (err.length) {
      console.error(
        'Failed to start segment: `settings.json` does not match the required schema:',
      );

      const errors = [];

      err.forEach((e) => {
        if (e.constraints) {
          errors.push(
            `- ${e.property} didn't pass validation: ${Object.values(
              e.constraints,
            ).join(', ')}`,
          );
        }

        if (e.children) {
          e.children.forEach((ec) => {
            errors.push(
              `- ${ec.property} didn't pass validation: ${Object.values(
                ec.constraints,
              ).join(', ')}`,
            );
          });
        }
      });

      errors.forEach((err) => {
        console.log(err);
      });

      process.exit(1);
    }
  });

  // Make sure that the userserver has
  // RSA public and private keys
  checkForKeys();

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory(errors) {
        const err = [];
        errors.forEach((e) => {
          err.push(
            `${e.property};${Object.values(e.constraints || {}).join(',')}`,
          );
        });

        return new BadRequestException(
          CreateApiResponse({
            status: 'FAIL',
            message: CommonMessages.ValidationError,
            data: {
              errors: err,
            },
          }),
        );
      },
    }),
  );
  app.enableCors();
  await app.listen(Settings.server.port);

  function checkForKeys() {
    if (!existsSync(__keyDir)) {
      mkdirSync(__keyDir, { recursive: true });
    }

    if (
      !existsSync(join(__keyDir, 'public.pem')) ||
      !existsSync(join(__keyDir, 'private.pem'))
    ) {
      // Generate RSA keys
      const keypair = new rsa({ b: Settings.server.keySize });
      config.keys.public = keypair.exportKey('public');
      config.keys.private = keypair.exportKey('private');

      writeFileSync(join(__keyDir, 'public.pem'), config.keys.public);
      writeFileSync(join(__keyDir, 'private.pem'), config.keys.private);
    }

    config.keys.public = readFileSync(join(__keyDir, 'public.pem')).toString();
    config.keys.private = readFileSync(
      join(__keyDir, 'private.pem'),
    ).toString();
  }
}

bootstrap();
