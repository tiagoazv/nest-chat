import { Test, TestingModule } from '@nestjs/testing';
import { BcryptService } from './bcrypt.service';

describe('BcryptService', () => {
  let service: BcryptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BcryptService],
    }).compile();

    service = module.get<BcryptService>(BcryptService);
  });

  it('should hash and compare passwords correctly', async () => {
    const password = 'mySecret123!';
    const hash = await service.hash(password);
    expect(typeof hash).toBe('string');
    expect(hash).not.toBe(password);
    const isMatch = await service.compare(password, hash);
    expect(isMatch).toBe(true);
    const isNotMatch = await service.compare('wrongPassword', hash);
    expect(isNotMatch).toBe(false);
  });
});
