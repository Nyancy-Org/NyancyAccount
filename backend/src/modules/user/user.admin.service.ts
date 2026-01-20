import { Injectable } from '@nestjs/common';
import { QueryOrder } from '@mikro-orm/core';
import bcrypt from 'bcryptjs';
import { UserService } from './user.service';
import {
  DeleteUserAdminDto,
  LoginLogDto,
  UpdateUserAdminDto,
} from './user.dto';
import { escapeWildcards } from '@/utils';

@Injectable()
export class UserAdminService extends UserService {
  // 用户列表
  async list(
    page: number,
    pageSize: number,
    sortBy: string,
    sortDesc: boolean,
    search: string,
  ) {
    const where: any = {};
    if (search) {
      const escapedSearch = escapeWildcards(search);
      where['$or'] = [
        { username: { $like: `%${escapedSearch}%` } },
        { role: { $like: `%${escapedSearch}%` } },
        { email: { $like: `%${escapedSearch}%` } },
        { apikey: { $like: `%${escapedSearch}%` } },
      ];
      if (!isNaN(Number(search))) {
        where['$or'].push({ id: Number(search) });
        where['$or'].push({ status: Number(search) });
      }
    }

    const orderBy = {
      [sortBy || 'id']: sortDesc ? QueryOrder.DESC : QueryOrder.ASC,
    };

    if (pageSize == -1) {
      const [users, count] = await this.userRepository.findAndCount(where, {
        orderBy,
      });
      return {
        msg: '获取成功',
        data: {
          totalCount: count,
          totalPages: 1,
          users,
        },
      };
    }

    const [users, count] = await this.userRepository.findAndCount(where, {
      orderBy,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    return {
      msg: '获取成功',
      data: {
        totalCount: count,
        totalPages: Math.ceil(count / pageSize),
        users,
      },
    };
  }

  // 更新指定用户信息
  async update_(body: UpdateUserAdminDto) {
    const user = await this.userRepository.findOne({ id: body.id });
    if (!user) throw new Error('User not found');

    if (user.username !== body.username) {
      await this.validateUName(body.username);
      const existing = await this.userRepository.findOne({
        username: body.username,
      });
      if (existing) throw new Error('该用户名已被占用，请换一个新的');
    }

    if (body.password && body.password !== user.password) {
      user.password = bcrypt.hashSync(body.password, 10);
    }

    if (body.apikey === 'true') {
      let apikey;
      let isUnique = false;
      while (!isUnique) {
        apikey = this.createApiKey(32);
        const existingUser = await this.userRepository.findOne({ apikey });
        if (!existingUser) {
          isUnique = true;
        }
      }
      user.apikey = apikey;
    } else if (body.apikey === 'false') {
      user.apikey = 'undefined';
    }

    user.username = body.username;
    user.email = body.email;
    user.status = Number(body.status);
    user.role = body.role;

    await this.em.flush();

    return {
      msg: '更新成功',
    };
  }

  // 删除用户
  async delete(body: DeleteUserAdminDto) {
    const user = await this.userRepository.findOne({ id: body.id });
    if (user) {
      await this.em.removeAndFlush(user);
    }
    return {
      msg: '删除成功',
    };
  }

  // 登录日志
  async adminLoginLog(q: LoginLogDto) {
    const { page, pageSize, sortBy, sortDesc, search } = q;

    const where: any = {};
    if (search) {
      const escapedSearch = escapeWildcards(search);
      where['$or'] = [
        { ip: { $like: `%${escapedSearch}%` } },
        { location: { $like: `%${escapedSearch}%` } },
        { device: { $like: `%${escapedSearch}%` } },
      ];
    }

    const orderBy = {
      [sortBy || 'id']: sortDesc ? QueryOrder.DESC : QueryOrder.ASC,
    };

    if (pageSize == -1) {
      const [records, count] = await this.userIpRepository.findAndCount(where, {
        orderBy,
      });
      return {
        msg: '获取成功',
        data: {
          totalCount: count,
          totalPages: 1,
          records,
        },
      };
    }

    const [records, count] = await this.userIpRepository.findAndCount(where, {
      orderBy,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    return {
      msg: '获取成功',
      data: {
        totalCount: count,
        totalPages: Math.ceil(count / pageSize),
        records,
      },
    };
  }
}
