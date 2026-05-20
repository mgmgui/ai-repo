import { UserService } from '../../src/services/userService';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
  });

  describe('createUser', () => {
    it('应成功创建用户', () => {
      const user = service.createUser('张三', 'zhangsan@example.com');
      expect(user.id).toBeDefined();
      expect(user.name).toBe('张三');
      expect(user.email).toBe('zhangsan@example.com');
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('邮箱应被转为小写', () => {
      const user = service.createUser('李四', 'LiSi@Example.COM');
      expect(user.email).toBe('lisi@example.com');
    });

    it('用户名应去除首尾空白', () => {
      const user = service.createUser('  王五  ', 'wangwu@example.com');
      expect(user.name).toBe('王五');
    });

    it('空用户名应抛出错误', () => {
      expect(() => service.createUser('', 'test@example.com')).toThrow('用户名不能为空');
    });

    it('非法邮箱应抛出错误', () => {
      expect(() => service.createUser('Test', 'invalid-email')).toThrow('邮箱格式不合法');
    });

    it('重复邮箱应抛出错误', () => {
      service.createUser('用户A', 'dup@example.com');
      expect(() => service.createUser('用户B', 'dup@example.com')).toThrow('邮箱已被注册');
    });
  });

  describe('findById', () => {
    it('应能通过 ID 查找用户', () => {
      const created = service.createUser('赵六', 'zhaoliu@example.com');
      const found = service.findById(created.id);
      expect(found).toEqual(created);
    });

    it('不存在的 ID 应返回 undefined', () => {
      expect(service.findById('nonexistent')).toBeUndefined();
    });
  });
});
