import { Test, TestingModule } from '@nestjs/testing';
import { MainService } from './main.service';

describe('MainService', () => {
  let service: MainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MainService],
    }).compile();

    service = module.get<MainService>(MainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
