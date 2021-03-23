import { Test, TestingModule } from '@nestjs/testing';
import { QuestionnaireResolver } from './questionnaire.resolver';

describe('QuestionnaireResolver', () => {
    let resolver: QuestionnaireResolver;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [QuestionnaireResolver],
        }).compile();

        resolver = module.get<QuestionnaireResolver>(QuestionnaireResolver);
    });

    it('should be defined', () => {
        expect(resolver).toBeDefined();
    });
});
