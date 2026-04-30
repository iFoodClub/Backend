import * as bcrypt from 'bcrypt';
import { UpdateUserService } from './update-user.use-cases';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UpdateUserService', () => {
  let repo: { updateImage: jest.Mock };
  let service: UpdateUserService;

  beforeEach(() => {
    repo = { updateImage: jest.fn() };
    service = new UpdateUserService(repo as any);
    (bcrypt.hash as jest.Mock).mockReset();
  });

  it('atualiza sem mexer na senha quando ela não é enviada', async () => {
    repo.updateImage.mockResolvedValue({ id: 1, email: 'a@a.com' });

    const result = await service.execute(1, { profileImage: 'x.png' });

    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(repo.updateImage).toHaveBeenCalledWith(1, { profileImage: 'x.png' });
    expect(result).toEqual({ id: 1, email: 'a@a.com' });
  });

  it('gera hash da senha antes de chamar o repositório', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('HASHED');
    repo.updateImage.mockResolvedValue({ id: 1 });

    await service.execute(1, { password: 'plain-text-123' });

    expect(bcrypt.hash).toHaveBeenCalledWith('plain-text-123', 10);
    expect(repo.updateImage).toHaveBeenCalledWith(1, { password: 'HASHED' });
  });
});
