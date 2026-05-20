"use strict";
/**
 * 通用校验工具函数
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEmail = validateEmail;
exports.isNonEmpty = isNonEmpty;
exports.isInRange = isInRange;
/**
 * 验证邮箱格式
 * @param email - 待验证的邮箱字符串
 * @returns 是否合法
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * 验证字符串是否非空
 * @param value - 待验证的字符串
 * @returns 是否非空
 */
function isNonEmpty(value) {
    return value.trim().length > 0;
}
/**
 * 验证数字是否在指定范围内
 * @param value - 待验证的数字
 * @param min - 最小值（含）
 * @param max - 最大值（含）
 * @returns 是否在范围内
 */
function isInRange(value, min, max) {
    return value >= min && value <= max;
}
//# sourceMappingURL=validator.js.map