/**
 * 通用校验工具函数
 */

/**
 * 验证邮箱格式
 * @param email - 待验证的邮箱字符串
 * @returns 是否合法
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证字符串是否非空
 * @param value - 待验证的字符串
 * @returns 是否非空
 */
export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * 验证数字是否在指定范围内
 * @param value - 待验证的数字
 * @param min - 最小值（含）
 * @param max - 最大值（含）
 * @returns 是否在范围内
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * 验证中国大陆手机号格式
 * @param phone - 待验证的手机号字符串
 * @returns 是否合法
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}
