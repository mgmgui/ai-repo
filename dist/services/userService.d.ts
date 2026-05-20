/**
 * 用户服务层
 * 演示：可测试的业务逻辑单元，AI 可安全修改的模块
 */
import { User } from '../models/user';
export declare class UserService {
    private users;
    /**
     * 创建新用户
     * @param name - 用户名
     * @param email - 邮箱
     * @returns 创建的用户对象
     * @throws Error 当参数不合法时
     */
    createUser(name: string, email: string): User;
    /**
     * 根据 ID 查找用户
     */
    findById(id: string): User | undefined;
    /**
     * 根据邮箱查找用户
     */
    findByEmail(email: string): User | undefined;
    private generateId;
}
//# sourceMappingURL=userService.d.ts.map