import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Translation {
    _id: Types.ObjectId;

    @Prop()
    key: string;

    @Prop()
    label: string;
}

export type TranslationDocument = Translation & Document;

export const TranslationSchema = SchemaFactory.createForClass(Translation);
