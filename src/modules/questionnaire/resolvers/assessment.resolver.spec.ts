import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentResolver } from './assessment.resolver';

describe('AssessmentResolver', () => {
  let resolver: AssessmentResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssessmentResolver],
    }).compile();

    resolver = module.get<AssessmentResolver>(AssessmentResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
