import { Field } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Translation extends Document {
    @Field(() => String)
    _id: Types.ObjectId;

    @Field(() => String)
    @Prop()
    key: string;

    @Field(() => String)
    @Prop()
    label: string;
}
export const TranslationSchema = SchemaFactory.createForClass(Translation);
