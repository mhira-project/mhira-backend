import { MailerService } from '@nestjs-modules/mailer';
import { Logger } from '@nestjs/common';
import { Assessment } from 'src/modules/assessment/models/assessment.model';
import { AssessmentEmailStatus } from 'src/modules/assessment/enums/assessment-emailstatus.enum';
import { AssessmentStatus } from 'src/modules/questionnaire/enums/assessment-status.enum';
import { QuestionnaireAssessmentService } from 'src/modules/questionnaire/services/questionnaire-assessment.service';
import { Repository } from 'typeorm';
import { SendMailService } from './send-mail.service';

// BUGS.md, B52: a reminder the mail cron cannot send must not end the
// process. It is logged, keeps its SCHEDULED status for the next run, and
// the other reminders of the same run are sent as before.

const VALID_DOCUMENT = '5f1d7f3b9d3e2a0012345678';
const MISSING_DOCUMENT = '5f1d7f3b9d3e2a0087654321';

function dueReminder(
    id: number,
    body: string,
    questionnaireAssessmentId = VALID_DOCUMENT,
): Assessment {
    return ({
        id,
        uuid: `00000000-0000-4000-8000-00000000000${id}`,
        questionnaireAssessmentId,
        receiverEmail: `patient${id}@example.org`,
        deleted: false,
        expirationDate: null,
        mailTemplate: { subject: 'Your assessment', body },
    } as unknown) as Assessment;
}

// The reminders run unawaited, through several promise hops and the mocked
// writes; ten turns of the event loop let them settle and give Node the
// chance to report an unhandled rejection.
async function settle() {
    for (let turn = 0; turn < 10; turn++) {
        await new Promise(resolve => setImmediate(resolve));
    }
}

describe('SendMailService.checkAssessmentEmails', () => {
    let unhandled: unknown[];
    const onUnhandled = (reason: unknown) => unhandled.push(reason);
    let loggedErrors: string[];

    beforeAll(() => {
        process.env.FRONTEND_ENCRYPTION_KEY = 'unit-test-key';
    });

    beforeEach(() => {
        unhandled = [];
        loggedErrors = [];
        process.on('unhandledRejection', onUnhandled);
        jest.spyOn(Logger.prototype, 'error').mockImplementation(
            (message: string) => {
                loggedErrors.push(message);
            },
        );
    });

    afterEach(() => {
        process.removeListener('unhandledRejection', onUnhandled);
        jest.restoreAllMocks();
    });

    function setUp(
        reminders: Assessment[],
        options: { statusWritesFail?: boolean } = {},
    ) {
        const update = jest.fn(() =>
            options.statusWritesFail
                ? Promise.reject(new Error('connection terminated'))
                : Promise.resolve({}),
        );
        const queryBuilder = {
            leftJoinAndSelect: () => queryBuilder,
            where: () => queryBuilder,
            getMany: () => Promise.resolve(reminders),
        };
        const assessmentRepository = {
            createQueryBuilder: () => queryBuilder,
            update,
        };
        const sendMail = jest.fn(() => Promise.resolve({}));
        const getById = jest.fn((id: string) =>
            Promise.resolve(
                id === MISSING_DOCUMENT
                    ? null
                    : { status: AssessmentStatus.PLANNED },
            ),
        );

        const service = new SendMailService(
            ({ getById } as unknown) as QuestionnaireAssessmentService,
            ({ sendMail } as unknown) as MailerService,
            (assessmentRepository as unknown) as Repository<Assessment>,
        );
        return { service, update, sendMail };
    }

    it.each([
        ['its template does not compile', dueReminder(1, 'Hello {{#if link}}')],
        [
            'its Mongo document is missing',
            dueReminder(1, 'Hello {{link}}', MISSING_DOCUMENT),
        ],
    ])(
        'logs a reminder that fails because %s, leaves it SCHEDULED and sends the others',
        async (_cause, failing) => {
            const { service, update, sendMail } = setUp([
                failing,
                dueReminder(2, 'Hello {{link}}'),
            ]);

            await service.checkAssessmentEmails();
            await settle();

            expect(unhandled).toEqual([]);
            expect(loggedErrors).toEqual([
                'checkAssessmentEmails: the reminder of assessment 1 failed and stays SCHEDULED (B52)',
            ]);
            expect(update.mock.calls).toEqual([
                [2, { emailStatus: AssessmentEmailStatus.SENT }],
            ]);
            expect(sendMail).toHaveBeenCalledTimes(1);
            expect(sendMail).toHaveBeenCalledWith(
                expect.objectContaining({ to: 'patient2@example.org' }),
            );
        },
    );

    it('logs a reminder whose SENT and FAILED status writes both fail', async () => {
        const { service, update, sendMail } = setUp(
            [dueReminder(1, 'Hello {{link}}')],
            { statusWritesFail: true },
        );

        await service.checkAssessmentEmails();
        await settle();

        expect(unhandled).toEqual([]);
        expect(sendMail).toHaveBeenCalledTimes(1);
        expect(update.mock.calls).toEqual([
            [1, { emailStatus: AssessmentEmailStatus.SENT }],
            [1, { emailStatus: AssessmentEmailStatus.FAILED }],
        ]);
        expect(loggedErrors).toEqual([
            'checkAssessmentEmails: the reminder of assessment 1 failed and stays SCHEDULED (B52)',
        ]);
    });
});
