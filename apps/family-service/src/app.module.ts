import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { join } from 'path';

import { HealthModule } from './modules/health/health.module';
import { MemberModule } from './modules/member/member.module';
import { GoalModule } from './modules/goal/goal.module';
import { DeviceModule } from './modules/device/device.module';
import { AutomationModule } from './modules/automation/automation.module';
import { ArchiveModule } from './modules/archive/archive.module';
import { AuthModule } from './modules/auth/auth.module';
import { AiModule } from './modules/ai/ai.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'schema.graphql'),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      introspection: process.env.NODE_ENV !== 'production',
      context: ({ req }: { req: any }) => ({ req }),
      subscriptions: {
        'graphql-ws': true,
      },
    }),
    HealthModule,
    MemberModule,
    GoalModule,
    DeviceModule,
    AutomationModule,
    ArchiveModule,
    AuthModule,
    AiModule,
    NotificationModule,
  ],
})
export class AppModule {}
