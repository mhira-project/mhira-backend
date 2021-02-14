import { Model } from 'mongoose';
import xlsx from 'node-xlsx';
import { Questionnaire } from '../models/questionnaire.schema';
//import { Questionnaire } from '../models/questionnaire-version.schema';

export interface FileData {
    name: string;
    data: string[][];
}

export interface questionData {
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
    calculation: string;
    image: string;
}

export interface choiceData {
    list_name: string;
    name: string;
    label: string;
    'media::image': string;
}

enum XLSFormSheets {
    SURVEY = 'survey',
    CHOICES = 'choices',
    SETTINGS = 'settings',
}

export class XLSForm {
    //  private questionnaire: Questionnaire;

    private sheets: FileData[];

    constructor() {
        // TODO: set fileData[] here
    } // TODO: use xslx parsing method here

    createQuestionnaire(): Model<Questionnaire> {
        return null;
    }

    createQuestionData(): Partial<questionData>[] {
        return this.formatData<questionData>(XLSFormSheets.SURVEY);
    }

    getChoiceData(): Partial<choiceData>[] {
        return this.formatData<choiceData>(XLSFormSheets.CHOICES);
    }

    private formatData<T>(
        sheetName: string = XLSFormSheets.SURVEY,
    ): Partial<T>[] {
        const formattedData: Partial<T>[] = [];
        const columns = this.getColumnDefinitions(sheetName);
        for (const choiceObject of this.getRowData(sheetName)) {
            const dataObject: Partial<T> = {};

            for (const column of columns) {
                const columnValue = this.getColumnOfRow(
                    choiceObject,
                    columns,
                    column,
                );
                if (!!columnValue && column in dataObject) {
                    dataObject[column] = columnValue;
                }
            }
            formattedData.push(dataObject);
        }

        return formattedData;
    }

    private getSheet(sheetName: string = XLSFormSheets.SURVEY) {
        return this.sheets.filter(sheet => sheet.name === sheetName)[0];
    }

    private getColumnOfRow(
        row: string[],
        columns: string[],
        columnName: string,
    ) {
        return row[columns.indexOf(columnName)];
    }

    private getColumnDefinitions(sheetName: string = XLSFormSheets.SURVEY) {
        return this.getSheet(sheetName)?.data[0];
    }

    private getRowData(sheetName: string = XLSFormSheets.SURVEY) {
        return this.getSheet(sheetName)?.data.filter(
            (item, index) => !!item && index > 0,
        );
    }
}
