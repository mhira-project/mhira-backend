import xlsx from 'node-xlsx';

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
    precision: number;
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

enum XLSFormSheets {
    SURVEY = 'survey',
    CHOICES = 'choices',
    SETTINGS = 'settings',
}

enum QuestionnaireType {
    OTHER = 'Other',
    SCREENING = 'Screening',
    DIAGNOSING = 'Diagnosing',
    TREATMENT_MONITORING = 'Treatment Monitoring',
}

const isEnumKey = <T>(obj: T, key: any): key is T => {
    return Object.values(obj).includes(key);
};

export class XLSForm {
    private choiceData: Partial<ChoiceData>[];

    constructor(private sheets: FileData[]) {} // TODO: MAYBE use xslx parsing method here

    public getSettings(): Partial<FormSettings> {
        return this.formatData<FormSettings>(XLSFormSheets.SETTINGS)[0];
    }

    public getQuestionData(): Partial<QuestionData>[] {
        return this.formatData<QuestionData>(XLSFormSheets.SURVEY);
    }

    getChoiceData(): Partial<ChoiceData>[] {
        if (!this.choiceData) {
            this.choiceData = this.formatData<ChoiceData>(
                XLSFormSheets.CHOICES,
            );
        }
        return this.choiceData;
    }

    private formatData<T>(
        sheetName: string = XLSFormSheets.SURVEY,
    ): Partial<T>[] {
        const formattedData: Partial<T>[] = [];
        const columns = this.getColumnDefinitions(sheetName);
        const rows = this.getRowData(sheetName);

        for (const rowObject of rows) {
            if (rowObject.length === 0) {
                continue;
            }
            const dataObject: Partial<T> = {};

            for (const column of columns) {
                const columnValue = this.getColumnOfRow(
                    rowObject,
                    columns,
                    column,
                );

                if (columnValue) {
                    if (column === 'questionnaire_type') {
                        dataObject[column] = !isEnumKey(
                            QuestionnaireType,
                            columnValue,
                        )
                            ? QuestionnaireType.OTHER
                            : columnValue;
                    } else {
                        dataObject[column] =
                            columnValue === 'yes' || columnValue === 'no'
                                ? columnValue === 'yes'
                                : columnValue;
                    }
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
