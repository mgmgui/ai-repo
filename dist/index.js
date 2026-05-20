"use strict";
/**
 * AI 时代代码仓库快速迭代新范式 - 示例入口
 * 本项目演示：四层防线 + 栈式交付 + AI PR 审查的完整工作流
 */
Object.defineProperty(exports, "__esModule", { value: true });
const userService_1 = require("./services/userService");
const validator_1 = require("./utils/validator");
const userService = new userService_1.UserService();
// 示例：创建用户
const email = 'demo@example.com';
if ((0, validator_1.validateEmail)(email)) {
    const user = userService.createUser('Demo User', email);
    // eslint-disable-next-line no-console
    console.log('用户创建成功:', user);
}
else {
    // eslint-disable-next-line no-console
    console.error('邮箱格式无效');
}
//# sourceMappingURL=index.js.map