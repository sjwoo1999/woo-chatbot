import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { moderate } from './moderation';

@Injectable()
export class SafetyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const body = req.body as { messages?: { role: string; content: string }[] };

    const last = body?.messages?.[body.messages.length - 1];
    const text = last?.content ?? '';
    const result = moderate(text);

    if (result.blocked) {
      throw new ForbiddenException({
        reason: 'safety_block',
        categories: result.categories,
        message: '안전 정책에 의해 차단되었습니다.'
      });
    }

    if (result.warn) {
      // 입력 본문을 마스킹 결과로 치환
      if (body && last) {
        last.content = result.maskedText;
      }
    }

    return true;
  }
}
