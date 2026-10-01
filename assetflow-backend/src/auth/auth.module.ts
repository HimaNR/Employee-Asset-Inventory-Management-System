import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { EmployeesModule } from '../employees/employees.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  // Secrets are passed per call (access vs refresh), so no default secret here
  imports: [JwtModule.register({}), EmployeesModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    // Global guards, in this order: 1) who are you?  2) are you allowed?
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AuthModule {}
