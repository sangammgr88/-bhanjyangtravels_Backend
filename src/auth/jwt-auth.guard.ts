import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or missing token');
    }
    const req = context.switchToHttp().getRequest();
    req.user = user; // 🔥 sets req.user, so RolesGuard will work
    return user; // ✅ don't call super, just return user
  }
}
