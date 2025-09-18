import { Test, TestingModule } from '@nestjs/testing';
import { HashingService } from './hashing.service';

describe('HashingService', () => {
  let service: HashingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HashingService],
    }).compile();

    service = module.get<HashingService>(HashingService);
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
