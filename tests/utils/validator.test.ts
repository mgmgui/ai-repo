import { validateEmail, isNonEmpty, isInRange } from '../../src/utils/validator';

describe('validateEmail', () => {
  it('合法邮箱应返回 true', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('test.name+tag@domain.co')).toBe(true);
  });

  it('非法邮箱应返回 false', () => {
    expect(validateEmail('notanemail')).toBe(false);
    expect(validateEmail('@no-local.com')).toBe(false);
    expect(validateEmail('no-at-sign')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });
});

describe('isNonEmpty', () => {
  it('非空字符串应返回 true', () => {
    expect(isNonEmpty('hello')).toBe(true);
    expect(isNonEmpty('  hi  ')).toBe(true);
  });

  it('空字符串或纯空白应返回 false', () => {
    expect(isNonEmpty('')).toBe(false);
    expect(isNonEmpty('   ')).toBe(false);
  });
});

describe('isInRange', () => {
  it('在范围内应返回 true', () => {
    expect(isInRange(5, 1, 10)).toBe(true);
    expect(isInRange(1, 1, 10)).toBe(true);
    expect(isInRange(10, 1, 10)).toBe(true);
  });

  it('超出范围应返回 false', () => {
    expect(isInRange(0, 1, 10)).toBe(false);
    expect(isInRange(11, 1, 10)).toBe(false);
  });
});
