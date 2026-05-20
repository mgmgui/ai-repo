"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const validator_1 = require("../utils/validator");
class UserService {
    constructor() {
        this.users = new Map();
    }
    /**
     * 创建新用户
     * @param name - 用户名
     * @param email - 邮箱
     * @returns 创建的用户对象
     * @throws Error 当参数不合法时
     */
    createUser(name, email) {
        if (!(0, validator_1.isNonEmpty)(name)) {
            throw new Error('用户名不能为空');
        }
        if (!(0, validator_1.validateEmail)(email)) {
            throw new Error('邮箱格式不合法');
        }
        if (this.findByEmail(email)) {
            throw new Error('邮箱已被注册');
        }
        const user = {
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
    findById(id) {
        return this.users.get(id);
    }
    /**
     * 根据邮箱查找用户
     */
    findByEmail(email) {
        return Array.from(this.users.values()).find((u) => u.email === email.toLowerCase());
    }
    generateId() {
        return `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    }
}
exports.UserService = UserService;
//# sourceMappingURL=userService.js.map