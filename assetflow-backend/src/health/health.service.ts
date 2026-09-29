import {
  Injectable,
  Logger, // 🆕
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type CheckStatus = 'up' | 'down';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name); // 🆕

  constructor(private readonly prisma: PrismaService) {}

  async check() {
    const database = await this.checkDatabase();
    const isHealthy = database.status === 'up';

    const result = {
      status: isHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      checks: { database },
    };

    if (!isHealthy) {
      throw new ServiceUnavailableException({
        type: 'service-unavailable',
        title: 'Service unavailable',
        detail: 'One or more dependencies are down.',
        timestamp: result.timestamp,
        checks: result.checks, // extension field, kept by the filter
      });
    }
    return result;
  }

  private async checkDatabase(): Promise<{
    status: CheckStatus;
    responseTimeMs: number;
  }> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'up', responseTimeMs: Date.now() - start };
    } catch (error) {
      // 🆕 log the real reason (server-side only, never sent to the client)
      this.logger.error(
        `Database health check failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return { status: 'down', responseTimeMs: Date.now() - start };
    }
  }
}