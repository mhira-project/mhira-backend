import { QuestionnaireType, XLSFormSheets } from '../enums/xlsform-reader.enum';
import { QuestionType } from '../models/question.schema';
import { FileData, FormSettings, QuestionData, ChoiceData } from '../dtos/xlsform.dto'

const REQUIRED_COLUMNS = {
    [XLSFormSheets.SURVEY]: ['type', 'label', 'name'],
    [XLSFormSheets.CHOICES]: ['list_name', 'label', 'name'],
    [XLSFormSheets.SETTINGS]: [],
};

const isEnumKey = <T>(obj: T, key: any): key is T => {
    return Object.values(obj).includes(key);
};

export class XLSForm {
    private choiceData: Partial<ChoiceData>[];

    constructor(private sheets: FileData[]) {}

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
        sheetName: XLSFormSheets = XLSFormSheets.SURVEY,
    ): Partial<T>[] {
        const formattedData: Partial<T>[] = [];
        const columns = this.getColumnDefinitions(sheetName);
        const rows = this.getRowData(sheetName);

        this.validateData(rows, columns, sheetName);

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

                if (columnValue !== undefined) {
                    if (column === 'questionnaire_type') {
                        dataObject[column] = !isEnumKey(
                            QuestionnaireType,
                            columnValue,
                        )
                            ? QuestionnaireType.OTHER
                            : columnValue;
                    } else {
                        dataObject[column] = columnValue;
                    }
                }
            }
            formattedData.push(dataObject);
        }

        return formattedData;
    }

    private validateData(
        rows: string[][],
        columns: string[],
        sheetName: XLSFormSheets,
    ) {
        if (!REQUIRED_COLUMNS[sheetName].length) {
            return;
        }
        //Column titles validation
        const missingColumns = [];

        for (const columnName of REQUIRED_COLUMNS[sheetName]) {
            if (!columns.includes(columnName)) {
                missingColumns.push(columnName);
            }
        }

        if (missingColumns.length) {
            const errorMessages = missingColumns.map(
                column =>
                    `column "${column}" is missing on spreadsheet ${sheetName}!`,
            );

            throw Error(errorMessages.join('\r\n'));
        }

        //Column fields validation
        const missingColumnFields = {};

        for (const row of rows) {
            if (row.includes(QuestionType.END_GROUP) || !row.length) {
                continue;
            }

            for (const columnName of REQUIRED_COLUMNS[sheetName]) {
                if (!this.getColumnOfRow(row, columns, columnName)?.toString()) {
                    if (!missingColumnFields[columnName]) {
                        missingColumnFields[columnName] = 0;
                    }

                    missingColumnFields[columnName] += 1;
                }
            }
        }

        const errorMessages = Object.keys(missingColumnFields).map(key => {
            const number = missingColumnFields[key];

            return `${number} ${key}${
                number > 1 ? 's\rare' : '\ris'
            } missing on spreadsheet ${sheetName}!`;
        });

        if (errorMessages.length) {
            throw new Error(errorMessages.join('\r\n'));
        }
    }

    private getSheet(sheetName: XLSFormSheets = XLSFormSheets.SURVEY) {
        return this.sheets.filter(sheet => sheet.name === sheetName)[0];
    }

    private getColumnOfRow(
        row: string[],
        columns: string[],
        columnName: string,
    ) {
        return row[columns.indexOf(columnName)];
    }

    private getColumnDefinitions(
        sheetName: XLSFormSheets = XLSFormSheets.SURVEY,
    ) {
        return this.getSheet(sheetName)?.data?.[0].map(name =>
            name.replace(/\s+/g, ' ').trim(),
        );
    }

    private getRowData(sheetName: XLSFormSheets = XLSFormSheets.SURVEY) {
        return this.getSheet(sheetName)?.data?.filter(
            (item, index) => item.length != 0 && !!item && index > 0,
        );
    }
}
