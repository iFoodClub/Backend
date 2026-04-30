import { ListUsersService } from './list-users.use-cases';

describe('ListUsersService', () => {
  it('mapeia apenas id/email/userType/profileImage dos usuários', async () => {
    const userRepository = {
      list: jest.fn().mockResolvedValue([
        {
          id: 1,
          email: 'a@a.com',
          userType: 'employee',
          profileImage: 'a.png',
          password: 'hash',
          name: 'A',
        },
        {
          id: 2,
          email: 'b@b.com',
          userType: 'company',
          profileImage: 'b.png',
          password: 'hash',
          name: 'B',
        },
      ]),
    };
    const service = new ListUsersService(userRepository as any);

    const result = await service.execute();

    expect(result).toEqual([
      { id: 1, email: 'a@a.com', userType: 'employee', profileImage: 'a.png' },
      { id: 2, email: 'b@b.com', userType: 'company', profileImage: 'b.png' },
    ]);
  });

  it('retorna lista vazia quando não há usuários', async () => {
    const userRepository = { list: jest.fn().mockResolvedValue([]) };
    const service = new ListUsersService(userRepository as any);

    await expect(service.execute()).resolves.toEqual([]);
  });
});
