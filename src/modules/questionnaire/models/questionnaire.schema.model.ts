import { QuestionGroup } from './question-group.model';
import { Translation } from './translation.model';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Questionnaire {
    _id: Types.ObjectId;

    @Prop()
    name: string | Translation[];

    @Prop()
    languages: string;

    @Prop()
    abbreviation: string;

    @Prop()
    copyright: string;

    @Prop()
    license: string;

    @Prop()
    timeToComplete: number;

    @Prop()
    questionGroups: QuestionGroup[];
}

export type QuestionnaireDocument = Questionnaire & Document;

export const QuestionnaireSchema = SchemaFactory.createForClass(Questionnaire);
