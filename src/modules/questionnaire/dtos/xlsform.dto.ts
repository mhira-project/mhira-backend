import { QuestionnaireType } from "../enums/xlsform-reader.enum";

export interface FileData {
    name: string;
    data: string[][];
}

export interface FormSettings {
    form_title: string;
    form_id: string;
    version: string;
    submission_url: string;
    questionnaire_type: QuestionnaireType;
    language: string;
}

export interface QuestionData {
    type: string;
    name: string;
    label: string;
    min_length: number;
    max_length: number;
    relevant: string;
    choice_filter: string;
    appearance: string;
    hint: string;
    constraint: string;
    constraint_message: string;
    default: any;
    required: boolean;
    required_message: string;
    calculation: string;
    image: string;
}

export interface ChoiceData {
    list_name: string;
    name: string;
    label: string;
    'media::image': string;
}