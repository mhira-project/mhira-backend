import { Injectable } from '@nestjs/common';
import { infobipConfig } from 'src/config/infobip.config';
import { SendSMSDto } from '../dtos/SendSMS.dto';
import * as TransportSMS from 'bipsms';

@Injectable()
export class SmsService {

    protected infobipClient = new TransportSMS(infobipConfig);

    async sendSms(smsDto: SendSMSDto): Promise<void> {
        await this.sendInfobipSMS(smsDto);
    }


    protected async sendInfobipSMS(smsDto: SendSMSDto): Promise<any> {

        return new Promise((resolve, reject) => {

            const { to, from, message } = smsDto;

            //Set the message
            const data = { from: from, to: to, text: message };

            //Send an SMS
            this.infobipClient.sendSingleSMS(data,
                (error, response) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(response);
                    }
                }
            );
        });

    }

}
