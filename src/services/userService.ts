/**
 * 用户服务层
 * 演示：可测试的业务逻辑单元，AI 可安全修改的模块
 */
import { User } from '../models/user';
import { validateEmail, isNonEmpty } from '../utils/validator';

export class UserService {
  private users: Map<string, User> = new Map();

  /**
   * 创建新用户
   * @param name - 用户名
   * @param email - 邮箱
   * @returns 创建的用户对象
   * @throws Error 当参数不合法时
   */
  createUser(name: string, email: string): User {
    if (!isNonEmpty(name)) {
      throw new Error('用户名不能为空');
    }
    if (!validateEmail(email)) {
      throw new Error('邮箱格式不合法');
    }
    if (this.findByEmail(email)) {
      throw new Error('邮箱已被注册');
    }

    const user: User = {
      id: this.generateId(),
      name: name.trim(),
      email: email.toLowerCase(),
      createdAt: new Date(),
    };

    this.users.set(user.id, user);
    return user;
  }

  /**
   * 根据 ID 查找用户
   */
  findById(id: string): User | undefined {
    return this.users.get(id);
  }

  /**
   * 根据邮箱查找用户
   */
  findByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find((u) => u.email === email.toLowerCase());
  }

  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
}
