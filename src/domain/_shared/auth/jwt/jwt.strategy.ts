import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { z } from 'zod';
import { EnvService } from '@/shared/env/env.service';
import { PrismaService } from '@/shared/prisma/prisma.service';

const tokenPayloadSchema = z.object({
  sub: z.string().uuid(),
  jti: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  roles: z.array(z.enum(['USER', 'ARTISAN', 'MODERATOR', 'ADMIN'])),
});

export type TokenPayload = z.infer<typeof tokenPayloadSchema>;

interface CachedSession {
  id: string;
  isRevoked: boolean;
  expiresAt: string;
  userId: string;
  user: {
    id: string;
    isDisabled: boolean;
    roles: string[];
    email: string;
    name: string;
  };
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  private sessionCache = new Map<string, { data: CachedSession; cachedAt: number }>();

  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private readonly MAX_CACHE_SIZE = 1000;

  constructor(
    private env: EnvService,
    private prisma: PrismaService,
  ) {
    const publicKey = env.get('JWT_PUBLIC_KEY');

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.access_token,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: Buffer.from(publicKey, 'base64'),
      algorithms: ['RS256'],
    });

    setInterval(() => this.cleanupCache(), 10 * 60 * 1000); // 10 minutes
  }

  async validate(payload: TokenPayload) {
    const validatedPayload = tokenPayloadSchema.parse(payload);

    const session = await this.getSessionWithCache(validatedPayload.jti);

    if (!session) {
      throw new UnauthorizedException('Sessão não encontrada');
    }

    if (session.isRevoked) {
      this.removeFromCache(session.id);
      throw new UnauthorizedException('Sessão foi revogada, faça login novamente');
    }

    if (new Date(session.expiresAt) < new Date()) {
      this.removeFromCache(session.id);
      throw new UnauthorizedException('Sessão expirou, faça login novamente');
    }

    if (session.user.isDisabled) {
      this.removeFromCache(session.id);
      throw new UnauthorizedException('Seu usuário foi desabilitado, contate o suporte');
    }

    if (session.userId !== validatedPayload.sub) {
      this.removeFromCache(session.id);
      throw new UnauthorizedException('Sessão inválida, faça login novamente');
    }

    this.updateLastUsedAt(session.id).catch(() => {});

    return {
      sub: session.user.id,
      sessionId: session.id,
      email: session.user.email,
      name: session.user.name,
      roles: session.user.roles,
    };
  }

  private async getSessionWithCache(sessionId: string): Promise<CachedSession | null> {
    const cached = this.sessionCache.get(sessionId);
    if (cached && (Date.now() - cached.cachedAt) < this.CACHE_TTL) {
      return cached.data;
    }

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        isRevoked: true,
        expiresAt: true,
        userId: true,
        user: {
          select: {
            id: true,
            isDisabled: true,
            roles: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!session) {
      this.removeFromCache(sessionId);
      return null;
    }

    if (!session.isRevoked && !session.user.isDisabled) {
      this.addToCache(sessionId, {
        ...session,
        expiresAt: session.expiresAt.toISOString(),
        user: {
          ...session.user,
          roles: session.user.roles as string[],
        },
      });
    }

    return {
      ...session,
      expiresAt: session.expiresAt.toISOString(),
      user: {
        ...session.user,
        roles: session.user.roles as string[],
      },
    };
  }

  private addToCache(sessionId: string, session: CachedSession): void {
    if (this.sessionCache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.sessionCache.keys().next().value;
      this.sessionCache.delete(oldestKey);
    }

    this.sessionCache.set(sessionId, {
      data: session,
      cachedAt: Date.now(),
    });
  }

  private removeFromCache(sessionId: string): void {
    this.sessionCache.delete(sessionId);
  }

  private cleanupCache(): void {
    const now = Date.now();
    Array.from(this.sessionCache.entries()).forEach(([sessionId, cached]) => {
      if ((now - cached.cachedAt) > this.CACHE_TTL) {
        this.sessionCache.delete(sessionId);
      }
    });
  }

  private async updateLastUsedAt(sessionId: string): Promise<void> {
    try {
      await this.prisma.session.update({
        where: { id: sessionId },
        data: { lastUsedAt: new Date() },
      });
    } catch (error) {
      this.logger.error('Failed to update lastUsedAt:', error);
    }
  }

  public invalidateSessionCache(sessionId: string): void {
    this.removeFromCache(sessionId);
  }
}
