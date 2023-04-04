import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Types } from 'mongoose';
import { getConnection, IsNull, Repository } from 'typeorm';
import {
    Filter,
    InjectQueryService,
    mergeFilter,
    QueryService,
    SortDirection,
} from '@nestjs-query/core';
import { Assessment, FullAssessment } from '../models/assessment.model';
import { ConnectionType } from '@nestjs-query/query-graphql';
import { AssessmentType } from '../models/assessment-type.model';
import {
    AssessmentTypeConnection,
    AssessmentTypeQuery,
} from '../dtos/assessment-type.query';
import {
    CreateAssessmentTypeInput,
    UpdateAssessmentTypeInput,
} from '../dtos/create-assessment-type.input';
import { AssessmentTypeEnum } from '../enums/assessment-type.enum';

@Injectable()
export class AssessmentTypeService {
    constructor(
        @InjectRepository(Assessment)
        private assessmentRepository: Repository<Assessment>,
        @InjectRepository(AssessmentType)
        private assessmentTypeRepository: Repository<AssessmentType>,
        @InjectQueryService(AssessmentType)
        private readonly assessmentTypeQueryService: QueryService<
            AssessmentType
        >,
    ) {}

    async getAssessmentTypes(
        query: AssessmentTypeQuery,
    ): Promise<ConnectionType<AssessmentType>> {
        // Apply combined authorized filter

        // Apply default sort if not provided
        query.sorting = query.sorting?.length
            ? query.sorting
            : [{ field: 'id', direction: SortDirection.DESC }];

        const result: any = await AssessmentTypeConnection.createFromPromise(
            q => this.assessmentTypeQueryService.query(q),
            query,
            q => this.assessmentTypeQueryService.count(q),
        );

        return result;
    }

    async getActiveAssessmentTypes(): Promise<AssessmentType[]> {
        // Apply combined authorized filter

        const result = await this.assessmentTypeRepository.find({
            status: AssessmentTypeEnum.ACTIVE,
        });

        return result;
    }

    async createAssessmentType(
        input: CreateAssessmentTypeInput,
    ): Promise<AssessmentType> {
        const newAssesmentType = this.assessmentTypeRepository.create();

        newAssesmentType.name = input.name;
        newAssesmentType.status = input.status;

        return await this.assessmentTypeRepository.save(newAssesmentType);
    }

    async updateAssessmentType(
        input: UpdateAssessmentTypeInput,
    ): Promise<AssessmentType> {
        const assessmentType = await this.assessmentTypeRepository.findOne(
            input.assessmentTypeId,
        );

        if (!assessmentType)
            throw new NotFoundException('Assessment type not found!');

        assessmentType.name = input.name;
        assessmentType.status = input.status;

        return await this.assessmentTypeRepository.save(assessmentType);
    }

    async deleteAssessmentType(assessmentTypeId: number): Promise<any> {
        const assessmentType = await this.assessmentTypeRepository.findOne(
            assessmentTypeId,
        );

        if (!assessmentType)
            throw new NotFoundException('Assessment type not found!');

        const assessmentsByTypeId = await this.assessmentRepository.find({
            assessmentType: {
                id: assessmentType.id,
            },
        });

        if (assessmentsByTypeId.length !== 0) {
            throw new ConflictException('Cannot delete assessment type!');
        }

        await this.assessmentTypeRepository.delete(assessmentType.id);

        return true;
    }
}
