import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Questionnaire } from './questionnaire.model';

export enum QuestionType {
    TEXT = 'text',
    NUMBER = 'number',
    CHOICE = 'choice',
    CHECKBOX = 'checkbox',
    TIME = 'time',
    DATE = 'date'
};

registerEnumType(QuestionType, { name: 'QuestionType' });

@ObjectType()
export class ValidationRules {

    @Field(() => Int)
    minimum: number;

    @Field(() => Int)
    maximum: number;
    // decimalPlaces: number;

    @Field(() => String)
    regex: RegExp;
}

@ObjectType()
export class ValidationMessages {

    @Field(() => String)
    minimum: string;

    @Field(() => String)
    maximum: string;

    @Field(() => String)
    regex: string;
}

@ObjectType()
export class DisplayProperties {

    @Field(() => Int)
    height: number;

    @Field(() => Int)
    width: number;

    // @Field(() => String)
    // representation: string;
}

@ObjectType()
@Entity('questionnaire_question')
export class Question extends BaseEntity {

    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => Int)
    @Column()
    questionnaireId: number;

    @Field()
    @Column()
    type: QuestionType;

    @Field()
    @Column()
    text: string;

    @Field()
    @Column()
    help: string;

    @Field()
    @Column()
    isOptional: boolean;

    @Field()
    @Column()
    isPersonalInformation: boolean;

    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;

    @Field({ nullable: true })
    @DeleteDateColumn()
    deletedAt?: Date;

    // @Field()
    // @Column()
    // options: string;

    @Field({ nullable: true })
    @Column({ type: 'jsonb', nullable: true })
    validationRules: ValidationRules;

    @Field({ nullable: true })
    @Column({ type: 'jsonb', nullable: true })
    validationMessages: ValidationMessages;

    @Field({ nullable: true })
    @Column({ type: 'jsonb', nullable: true })
    displayProperties: DisplayProperties;

    @ManyToOne(() => Questionnaire, questionnaire => questionnaire.questions)
    questionnaire: Questionnaire;
}
