/**
 * 通用校验工具函数
 */
/**
 * 验证邮箱格式
 * @param email - 待验证的邮箱字符串
 * @returns 是否合法
 */
export declare function validateEmail(email: string): boolean;
/**
 * 验证字符串是否非空
 * @param value - 待验证的字符串
 * @returns 是否非空
 */
export declare function isNonEmpty(value: string): boolean;
/**
 * 验证数字是否在指定范围内
 * @param value - 待验证的数字
 * @param min - 最小值（含）
 * @param max - 最大值（含）
 * @returns 是否在范围内
 */
export declare function isInRange(value: number, min: number, max: number): boolean;
//# sourceMappingURL=validator.d.ts.map