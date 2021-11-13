import { Injectable } from '@nestjs/common';
import * as xls2xform from 'xls2xform';
import * as fs from 'fs';

const temp = require('temp').track();

@Injectable()
export class Xls2XformHelper {

    pythonPath: string;

    async xls2xform(pathToXlsForm: string): Promise<any> {

        const options = {} as any;
        if (this.pythonPath) options.pythonPath = this.pythonPath;

        return new Promise((resolve, reject) => {
            xls2xform(pathToXlsForm, options,
                function (error, xform) {
                    //process error if any
                    if (error) reject(error);
                    //use returned xform  

                    resolve(xform);
                });
        });
    }

    /**
     * 
     * @param data Content to write to temp file
     * @return object with `path` and `fd` - file descriptor
     */
    async writeDataToTempFile(data: any): Promise<{path: string, fd: any}> {

        // Process the data (note: error handling omitted)

        return new Promise((resolve, reject) => {

            temp.open('xform', function (err, info) {
                if (!err) {
                    fs.write(info.fd, data, (err) => {
                        console.log(err);
                    });
                    fs.close(info.fd, function (err) {
                        console.log('done')
                    });
    
                    return info;
                }
                else {
                    console.error(err)
                }
            });
        });
        
    }
}
