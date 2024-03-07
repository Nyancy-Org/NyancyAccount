import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { db } from '../Service/mysql';

@Injectable()
export class CheckAuthGuard
  extends AuthGuard('session')
  implements CanActivate
{
  async canActivate(context: ExecutionContext) {
    // 在这里可以根据 session 中的内容进行自定义判断

    // 如果 session 中的某个属性满足特定条件，则允许访问
    const session = context.switchToHttp().getRequest().session;
    if (session && session.login === true) {
      return true;
    }

    // 如果判断不满足条件，则禁止访问
    return false;
  }
}

@Injectable()
export class isAdmin extends CheckAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    // 调用父类 AuthGuard 的 canActivate() 方法获取父类的结果
    const isAuthenticated = super.canActivate(context);
    const session = context.switchToHttp().getRequest().session;
    if (!(await isAuthenticated)) {
      return false;
    }
    const [r] = await db.query('select role from user where id=?', [
      session.uid,
    ]);
    if (r.role === 'admin') {
      return true;
    }

    return false;
  }
}
