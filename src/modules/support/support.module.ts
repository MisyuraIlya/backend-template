import { Module }            from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule }      from '@nestjs-modules/mailer';
import { SupportService }    from './support.service';
import { SupportController } from './support.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { History } from '../history/entities/history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([History]),
    ConfigModule.forRoot({ isGlobal: true }),

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const user = config.get<string>('MAIL_USER');
        const pass = encodeURIComponent(config.get<string>('MAIL_PASS')!);    
        const host = config.get<string>('MAIL_HOST');
        const port = config.get<number>('MAIL_PORT');

        return {
          transport: {
            host,
            port,
            secure: config.get<boolean>('MAIL_SECURE', false),
            auth: {
              user,
              pass,
            },
          },
          defaults: {
            from: `"No Reply" <${config.get('MAIL_FROM')}>`,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [SupportController],
  providers: [SupportService],
  exports: [SupportService],
})
export class SupportModule {}
