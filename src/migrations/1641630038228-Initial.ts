import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1641630038228 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `--
            -- PostgreSQL database dump
            --

            CREATE TABLE public.access_token (
                id character varying NOT NULL,
                "userId" integer NOT NULL,
                "isRevoked" boolean DEFAULT false NOT NULL,
                "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
                "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
                "expiresAt" timestamp without time zone NOT NULL
            );




            --
            -- Name: assessment; Type: TABLE; Schema: public; Owner: default
            --

            CREATE TABLE public.assessment (
                id integer NOT NULL,
                "questionnaireAssessmentId" character varying NOT NULL,
                date timestamp without time zone,
                name character varying,
                "patientId" integer NOT NULL,
                "clinicianId" integer,
                status character varying DEFAULT 'PENDING'::character varying NOT NULL,
                "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
                "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
                "deletedAt" timestamp without time zone,
                "isActive" boolean DEFAULT true NOT NULL,
                note character varying,
                uuid character varying,
                "informantClinicianId" integer,
                "expirationDate" timestamp without time zone,
                "deliveryDate" timestamp without time zone,
                "informantType" character varying,
                "informantCaregiverRelation" character varying
            );




            --
            -- Name: assessment_id_seq; Type: SEQUENCE; Schema: public; Owner: default
            --

            CREATE SEQUENCE public.assessment_id_seq
                AS integer
                START WITH 1
                INCREMENT BY 1
                NO MINVALUE
                NO MAXVALUE
                CACHE 1;




            --
            -- Name: assessment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: default
            --

            ALTER SEQUENCE public.assessment_id_seq OWNED BY public.assessment.id;


            --
            -- Name: caregiver; Type: TABLE; Schema: public; Owner: default
            --

            CREATE TABLE public.caregiver (
                id integer NOT NULL,
                "firstName" character varying,
                "middleName" character varying,
                "lastName" character varying,
                email character varying,
                phone character varying NOT NULL,
                "deletedAt" timestamp without time zone,
                "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
                "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
                street character varying,
                country character varying,
                place character varying,
                apartment character varying,
                "postalCode" character varying,
                number character varying
            );




            --
            -- Name: caregiver_id_seq; Type: SEQUENCE; Schema: public; Owner: default
            --

            CREATE SEQUENCE public.caregiver_id_seq
                AS integer
                START WITH 1
                INCREMENT BY 1
                NO MINVALUE
                NO MAXVALUE
                CACHE 1;




            --
            -- Name: caregiver_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: default
            --

            ALTER SEQUENCE public.caregiver_id_seq OWNED BY public.caregiver.id;


            --
            -- Name: department; Type: TABLE; Schema: public; Owner: default
            --

            CREATE TABLE public.department (
                id integer NOT NULL,
                name character varying NOT NULL,
                description character varying,
                active boolean DEFAULT true NOT NULL,
                "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
                "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
                "deletedAt" timestamp without time zone
            );




            --
            -- Name: COLUMN department.name; Type: COMMENT; Schema: public; Owner: default
            --

            COMMENT ON COLUMN public.department.name IS 'Department Name';


            --
            -- Name: department_id_seq; Type: SEQUENCE; Schema: public; Owner: default
            --

            CREATE SEQUENCE public.department_id_seq
                AS integer
                START WITH 1
                INCREMENT BY 1
                NO MINVALUE
                NO MAXVALUE
                CACHE 1;




            --
            -- Name: department_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: default
            --

            ALTER SEQUENCE public.department_id_seq OWNED BY public.department.id;


            --
            -- Name: disclaimer; Type: TABLE; Schema: public; Owner: default
            --

            CREATE TABLE public.disclaimer (
                type character varying NOT NULL,
                description character varying NOT NULL,
                "updatedAt" timestamp without time zone
            );




            --
            -- Name: emergency_contact; Type: TABLE; Schema: public; Owner: default
            --

            CREATE TABLE public.emergency_contact (
                id integer NOT NULL,
                "patientId" integer NOT NULL,
                "firstName" character varying NOT NULL,
                "middleName" character varying,
                "lastName" character varying NOT NULL,
                phone character varying,
                email character varying,
                "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
                "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
                "deletedAt" timestamp without time zone
            );




            --
            -- Name: emergency_contact_id_seq; Type: SEQUENCE; Schema: public; Owner: default
            --

            CREATE SEQUENCE public.emergency_contact_id_seq
                AS integer
                START WITH 1
                INCREMENT BY 1
                NO MINVALUE
                NO MAXVALUE
                CACHE 1;




            --
            -- Name: emergency_contact_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: default
            --

            ALTER SEQUENCE public.emergency_contact_id_seq OWNED BY public.emergency_contact.id;


            --
            -- Name: informant; Type: TABLE; Schema: public; Owner: default
            --

            CREATE TABLE public.informant (
                id integer NOT NULL,
                "patientId" integer NOT NULL,
                "firstName" character varying NOT NULL,
                "middleName" character varying,
                "lastName" character varying NOT NULL,
                phone character varying,
                email character varying,
                address character varying,
                "relationshipTypeId" integer,
                "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
                "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
                "deletedAt" timestamp without time zone
            );




            --
            -- Name: informant_id_seq; Type: SEQUENCE; Schema: public; Owner: default
            --

            CREATE SEQUENCE public.informant_id_seq
                AS integer
                START WITH 1
                INCREMENT BY 1
                NO MINVALUE
                NO MAXVALUE
                CACHE 1;




            --
            -- Name: informant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: default
            --

            ALTER SEQUENCE public.informant_id_seq OWNED BY public.informant.id;


            --
            -- Name: patient; Type: TABLE; Schema: public; Owner: default
            --

            CREATE TABLE public.patient (
                id integer NOT NULL,
                active boolean DEFAULT true NOT NULL,
                "statusId" integer,
                "medicalRecordNo" character varying,
                "firstName" character varying NOT NULL,
                "middleName" character varying,
                "lastName" character varying NOT NULL,
                phone character varying,
                phone2 character varying,
                email character varying,
                address character varying,
                "addressStreet" character varying,
                "addressNumber" character varying,
                "addressApartment" character varying,
                "addressPlace" character varying,
                "addressPostalCode" character varying,
                "addressCountryCode" character(2),
                gender character varying,
                "birthDate" date,
                "birthCountryCode" character(2),
                nationality character varying,
                "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
                "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
                "deletedAt" timestamp without time zone
            );




            --
            -- Name: patient_caregiver; Type: TABLE; Schema: public; Owner: default
            --

            CREATE TABLE public.patient_caregiver (
                id integer NOT NULL,
                "deletedAt" timestamp without time zone,
                "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
                "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
                "patientId" integer NOT NULL,
                "caregiverId" integer NOT NULL,
                relation character varying,
                note text,
                emergency boolean DEFAULT false
            );




            --
            -- Name: patient_caregiver_id_seq; Type: SEQUENCE; Schema: public; Owner: default
            --

            CREATE SEQUENCE public.patient_caregiver_id_seq
                AS integer
                START WITH 1
                INCREMENT BY 1
                NO MINVALUE
                NO MAXVALUE
                CACHE 1;




            --
            -- Name: patient_caregiver_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: default
            --

            ALTER SEQUENCE public.patient_caregiver_id_seq OWNED BY public.patient_caregiver.id;


            --
            -- Name: patient_case_manager; Type: TABLE; Schema: public; Owner: default
            --

            CREATE TABLE public.patient_case_manager (
                "patientId" integer NOT NULL,
                "userId" integer NOT NULL
            );




            --
            -- Name: patient_department; Type: TABLE; Schema: public; Owner: default
            --

            CREATE TABLE public.patient_department (
                "patientId" integer NOT NULL,
                "departmentId" integer NOT NULL
            );




            --
            -- Name: patient_id_seq; Type: SEQUENCE; Schema: public; Owner: default
            --

            CREATE SEQUENCE public.patient_id_seq
                AS integer
                START WITH 1
                INCREMENT BY 1
                NO MINVALUE
                NO MAXVALUE
                CACHE 1;




            --
            -- Name: patient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: default
            --

            ALTER SEQUENCE public.patient_id_seq OWNED BY public.patient.id;


            --
            -- Name: patient_status; Type: TABLE; Schema: public; Owner: default
            --

            CREATE TABLE public.patient_status (
                id integer NOT NULL,
                name character varying NOT NULL,
                description character varying,
                "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
                "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
                "deletedAt" timestamp without time zone
            );




            --
            -- Name: patient_status_id_seq; Type: SEQUENCE; Schema: public; Owner: default
            --

            CREATE SEQUENCE public.patient_status_id_seq
                AS integer
                START WITH 1
                INCREMENT BY 1
                NO MINVALUE
                NO MAXVALUE
                CACHE 1;




            --
            -- Name: patient_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: default
            --

            ALTER SEQUENCE public.patient_status_id_seq OWNED BY public.patient_status.id;


            --
            -- Name: permission; Type: TABLE; Schema: public; Owner: default
            --

            CREATE TABLE public.permission (
                id integer NOT NULL,
                name character varying NOT NULL,
                "group" character varying DEFAULT 'default'::character varying NOT NULL,
                "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
                "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
                "deletedAt" timestamp without time zone
            );




            --
            -- Name: permission_id_seq; Type: SEQUENCE; Schema: public; Owner: default
            --

            CREATE SEQUENCE public.permission_id_seq
                AS integer
                START WITH 1
                INCREMENT BY 1
                NO MINVALUE
                NO MAXVALUE
                CACHE 1;




            --
            -- Name: permission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: default
            --

            ALTER SEQUENCE public.permission_id_seq OWNED BY public.permission.id;


            --
            -- Name: questionnaire_script; Type: TABLE; Schema: public; Owner: default
            --

            CREATE TABLE public.questionnaire_script (
                id integer NOT NULL,
                name character varying NOT NULL,
                "scriptText" character varying NOT NULL,
                "repositoryLink" character varying,
                creator character varying,
                version character varying,
                "deletedAt" timestamp without time zone,
                "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
                "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
                "questionnaireId" character varying NOT NULL
            );




            --
            -- Name: questionnaire_script_id_seq; Type: SEQUENCE; Schema: public; Owner: default
            --

            CREATE SEQUENCE public.questionnaire_script_id_seq
                AS integer
                START WITH 1
                INCREMENT BY 1
                NO MINVALUE
                NO MAXVALUE
                CACHE 1;




            --
            -- Name: questionnaire_script_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: default
            --

            ALTER SEQUENCE public.questionnaire_script_id_seq OWNED BY public.questionnaire_script.id;


            --
            -- Name: questionnaire_script_report; Type: TABLE; Schema: public; Owner: default
            --

            CREATE TABLE public.questionnaire_script_report (
                "questionnaireScriptId" integer NOT NULL,
                "reportId" integer NOT NULL
            );




            --
            -- Name: relationship_type; Type: TABLE; Schema: public; Owner: default
            --

            CREATE TABLE public.relationship_type (
                id integer NOT NULL,
                name character varying NOT NULL,
                "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
                "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
                "deletedAt" timestamp without time zone
            );




            --
            -- Name: relationship_type_id_seq; Type: SEQUENCE; Schema: public; Owner: default
            --

            CREATE SEQUENCE public.relationship_type_id_seq
                AS integer
                START WITH 1
                INCREMENT BY 1
                NO MINVALUE
                NO MAXVALUE
                CACHE 1;




            --
            -- Name: relationship_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: default
            --

            ALTER SEQUENCE public.relationship_type_id_seq OWNED BY public.relationship_type.id;


            --
            -- Name: report; Type: TABLE; Schema: public; Owner: default
            --

            CREATE TABLE public.report (
                id integer NOT NULL,
                anonymus boolean,
                name character varying NOT NULL,
                description character varying NOT NULL,
                status boolean,
                "repositoryLink" character varying,
                "appName" character varying,
                url character varying,
                "deletedAt" timestamp without time zone,
                "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
                "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
                resources character varying NOT NULL
            );




            --
            -- Name: report_id_seq; Type: SEQUENCE; Schema: public; Owner: default
            --

            CREATE SEQUENCE public.report_id_seq
                AS integer
                START WITH 1
                INCREMENT BY 1
                NO MINVALUE
                NO MAXVALUE
                CACHE 1;




            --
            -- Name: report_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: default
            --

            ALTER SEQUENCE public.report_id_seq OWNED BY public.report.id;


            --
            -- Name: report_role; Type: TABLE; Schema: public; Owner: default
            --

            CREATE TABLE public.report_role (
                "reportId" integer NOT NULL,
                "roleId" integer NOT NULL
            );




            --
            -- Name: role; Type: TABLE; Schema: public; Owner: default
            --

            CREATE TABLE public.role (
                id integer NOT NULL,
                name character varying NOT NULL,
                code character varying,
                hierarchy integer DEFAULT 1000 NOT NULL,
                "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
                "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
                "deletedAt" timestamp without time zone
            );




            --
            -- Name: role_id_seq; Type: SEQUENCE; Schema: public; Owner: default
            --

            CREATE SEQUENCE public.role_id_seq
                AS integer
                START WITH 1
                INCREMENT BY 1
                NO MINVALUE
                NO MAXVALUE
                CACHE 1;




            --
            -- Name: role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: default
            --

            ALTER SEQUENCE public.role_id_seq OWNED BY public.role.id;


            --
            -- Name: role_permission; Type: TABLE; Schema: public; Owner: default
            --

            CREATE TABLE public.role_permission (
                "roleId" integer NOT NULL,
                "permissionId" integer NOT NULL
            );




            --
            -- Name: setting; Type: TABLE; Schema: public; Owner: default
            --

            CREATE TABLE public.setting (
                key character varying NOT NULL,
                value character varying
            );




            --
            -- Name: user; Type: TABLE; Schema: public; Owner: default
            --

            CREATE TABLE public."user" (
                id integer NOT NULL,
                "isSuperUser" boolean DEFAULT false NOT NULL,
                username character varying NOT NULL,
                password character varying NOT NULL,
                active boolean DEFAULT true NOT NULL,
                "firstName" character varying NOT NULL,
                "middleName" character varying,
                "lastName" character varying NOT NULL,
                email character varying,
                phone character varying,
                "workID" character varying,
                address character varying,
                gender character varying,
                "birthDate" timestamp without time zone,
                nationality character varying,
                "passwordExpiresAt" timestamp without time zone,
                "failedLoginAttempts" integer DEFAULT 0,
                "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
                "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
                "deletedAt" timestamp without time zone,
                "acceptedTerm" boolean DEFAULT false
            );




            --
            -- Name: COLUMN "user".username; Type: COMMENT; Schema: public; Owner: default
            --

            COMMENT ON COLUMN public."user".username IS 'Login Username';


            --
            -- Name: COLUMN "user".password; Type: COMMENT; Schema: public; Owner: default
            --

            COMMENT ON COLUMN public."user".password IS 'Hashed password';


            --
            -- Name: user_department; Type: TABLE; Schema: public; Owner: default
            --

            CREATE TABLE public.user_department (
                "userId" integer NOT NULL,
                "departmentId" integer NOT NULL
            );




            --
            -- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: default
            --

            CREATE SEQUENCE public.user_id_seq
                AS integer
                START WITH 1
                INCREMENT BY 1
                NO MINVALUE
                NO MAXVALUE
                CACHE 1;




            --
            -- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: default
            --

            ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


            --
            -- Name: user_permission; Type: TABLE; Schema: public; Owner: default
            --

            CREATE TABLE public.user_permission (
                "userId" integer NOT NULL,
                "permissionId" integer NOT NULL
            );




            --
            -- Name: user_previous_password; Type: TABLE; Schema: public; Owner: default
            --

            CREATE TABLE public.user_previous_password (
                id integer NOT NULL,
                "userId" integer NOT NULL,
                password character varying NOT NULL,
                "createdAt" timestamp without time zone DEFAULT now() NOT NULL
            );




            --
            -- Name: COLUMN user_previous_password.password; Type: COMMENT; Schema: public; Owner: default
            --

            COMMENT ON COLUMN public.user_previous_password.password IS 'previous hashed password';


            --
            -- Name: user_previous_password_id_seq; Type: SEQUENCE; Schema: public; Owner: default
            --

            CREATE SEQUENCE public.user_previous_password_id_seq
                AS integer
                START WITH 1
                INCREMENT BY 1
                NO MINVALUE
                NO MAXVALUE
                CACHE 1;




            --
            -- Name: user_previous_password_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: default
            --

            ALTER SEQUENCE public.user_previous_password_id_seq OWNED BY public.user_previous_password.id;


            --
            -- Name: user_role; Type: TABLE; Schema: public; Owner: default
            --

            CREATE TABLE public.user_role (
                "userId" integer NOT NULL,
                "roleId" integer NOT NULL
            );




            --
            -- Name: assessment id; Type: DEFAULT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.assessment ALTER COLUMN id SET DEFAULT nextval('public.assessment_id_seq'::regclass);


            --
            -- Name: caregiver id; Type: DEFAULT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.caregiver ALTER COLUMN id SET DEFAULT nextval('public.caregiver_id_seq'::regclass);


            --
            -- Name: department id; Type: DEFAULT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.department ALTER COLUMN id SET DEFAULT nextval('public.department_id_seq'::regclass);


            --
            -- Name: emergency_contact id; Type: DEFAULT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.emergency_contact ALTER COLUMN id SET DEFAULT nextval('public.emergency_contact_id_seq'::regclass);


            --
            -- Name: informant id; Type: DEFAULT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.informant ALTER COLUMN id SET DEFAULT nextval('public.informant_id_seq'::regclass);


            --
            -- Name: patient id; Type: DEFAULT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.patient ALTER COLUMN id SET DEFAULT nextval('public.patient_id_seq'::regclass);


            --
            -- Name: patient_caregiver id; Type: DEFAULT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.patient_caregiver ALTER COLUMN id SET DEFAULT nextval('public.patient_caregiver_id_seq'::regclass);


            --
            -- Name: patient_status id; Type: DEFAULT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.patient_status ALTER COLUMN id SET DEFAULT nextval('public.patient_status_id_seq'::regclass);


            --
            -- Name: permission id; Type: DEFAULT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.permission ALTER COLUMN id SET DEFAULT nextval('public.permission_id_seq'::regclass);


            --
            -- Name: questionnaire_script id; Type: DEFAULT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.questionnaire_script ALTER COLUMN id SET DEFAULT nextval('public.questionnaire_script_id_seq'::regclass);


            --
            -- Name: relationship_type id; Type: DEFAULT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.relationship_type ALTER COLUMN id SET DEFAULT nextval('public.relationship_type_id_seq'::regclass);


            --
            -- Name: report id; Type: DEFAULT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.report ALTER COLUMN id SET DEFAULT nextval('public.report_id_seq'::regclass);


            --
            -- Name: role id; Type: DEFAULT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.role ALTER COLUMN id SET DEFAULT nextval('public.role_id_seq'::regclass);


            --
            -- Name: user id; Type: DEFAULT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


            --
            -- Name: user_previous_password id; Type: DEFAULT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.user_previous_password ALTER COLUMN id SET DEFAULT nextval('public.user_previous_password_id_seq'::regclass);


            --
            -- Name: user_previous_password PK_111c7d3a7b907b32df75a40c464; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.user_previous_password
                ADD CONSTRAINT "PK_111c7d3a7b907b32df75a40c464" PRIMARY KEY (id);


            --
            -- Name: caregiver PK_114bf658fe2b416245381f89be0; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.caregiver
                ADD CONSTRAINT "PK_114bf658fe2b416245381f89be0" PRIMARY KEY (id);


            --
            -- Name: setting PK_1c4c95d773004250c157a744d6e; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.setting
                ADD CONSTRAINT "PK_1c4c95d773004250c157a744d6e" PRIMARY KEY (key);


            --
            -- Name: user_permission PK_1cf6c7f47d0655afa389e1bd594; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.user_permission
                ADD CONSTRAINT "PK_1cf6c7f47d0655afa389e1bd594" PRIMARY KEY ("userId", "permissionId");


            --
            -- Name: patient_status PK_36d8f3934760efc66ab3c8f4f2b; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.patient_status
                ADD CONSTRAINT "PK_36d8f3934760efc66ab3c8f4f2b" PRIMARY KEY (id);


            --
            -- Name: permission PK_3b8b97af9d9d8807e41e6f48362; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.permission
                ADD CONSTRAINT "PK_3b8b97af9d9d8807e41e6f48362" PRIMARY KEY (id);


            --
            -- Name: relationship_type PK_625c996ea49905f48fb8d3ebd32; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.relationship_type
                ADD CONSTRAINT "PK_625c996ea49905f48fb8d3ebd32" PRIMARY KEY (id);


            --
            -- Name: user_role PK_7b4e17a669299579dfa55a3fc35; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.user_role
                ADD CONSTRAINT "PK_7b4e17a669299579dfa55a3fc35" PRIMARY KEY ("userId", "roleId");


            --
            -- Name: patient_caregiver PK_835a0fa676526ee26379524b5fd; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.patient_caregiver
                ADD CONSTRAINT "PK_835a0fa676526ee26379524b5fd" PRIMARY KEY (id);

            --
            -- Name: patient PK_8dfa510bb29ad31ab2139fbfb99; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.patient
                ADD CONSTRAINT "PK_8dfa510bb29ad31ab2139fbfb99" PRIMARY KEY (id);


            --
            -- Name: emergency_contact PK_922933ddef34a7e1ed99ae692ce; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.emergency_contact
                ADD CONSTRAINT "PK_922933ddef34a7e1ed99ae692ce" PRIMARY KEY (id);


            --
            -- Name: report_role PK_92c09ae855bd4b108343fc7b72a; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.report_role
                ADD CONSTRAINT "PK_92c09ae855bd4b108343fc7b72a" PRIMARY KEY ("reportId", "roleId");


            --
            -- Name: informant PK_94eb2c5bcfa24d8ca2e9f865aeb; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.informant
                ADD CONSTRAINT "PK_94eb2c5bcfa24d8ca2e9f865aeb" PRIMARY KEY (id);


            --
            -- Name: report PK_99e4d0bea58cba73c57f935a546; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.report
                ADD CONSTRAINT "PK_99e4d0bea58cba73c57f935a546" PRIMARY KEY (id);


            --
            -- Name: department PK_9a2213262c1593bffb581e382f5; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.department
                ADD CONSTRAINT "PK_9a2213262c1593bffb581e382f5" PRIMARY KEY (id);


            --
            -- Name: questionnaire_script PK_a486e98875eace5a6257fd6b2f9; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.questionnaire_script
                ADD CONSTRAINT "PK_a486e98875eace5a6257fd6b2f9" PRIMARY KEY (id);


            --
            -- Name: role PK_b36bcfe02fc8de3c57a8b2391c2; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.role
                ADD CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY (id);


            --
            -- Name: role_permission PK_b42bbacb8402c353df822432544; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.role_permission
                ADD CONSTRAINT "PK_b42bbacb8402c353df822432544" PRIMARY KEY ("roleId", "permissionId");


            --
            -- Name: patient_case_manager PK_c0d1be43914a65c5089420f9976; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.patient_case_manager
                ADD CONSTRAINT "PK_c0d1be43914a65c5089420f9976" PRIMARY KEY ("patientId", "userId");


            --
            -- Name: assessment PK_c511a7dc128256876b6b1719401; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.assessment
                ADD CONSTRAINT "PK_c511a7dc128256876b6b1719401" PRIMARY KEY (id);


            --
            -- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public."user"
                ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


            --
            -- Name: patient_department PK_e7ab054764fdd17e31c8d30833d; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.patient_department
                ADD CONSTRAINT "PK_e7ab054764fdd17e31c8d30833d" PRIMARY KEY ("patientId", "departmentId");


            --
            -- Name: user_department PK_e9eb3bd561dde9b9f1ce2b467e7; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.user_department
                ADD CONSTRAINT "PK_e9eb3bd561dde9b9f1ce2b467e7" PRIMARY KEY ("userId", "departmentId");


            --
            -- Name: access_token PK_f20f028607b2603deabd8182d12; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.access_token
                ADD CONSTRAINT "PK_f20f028607b2603deabd8182d12" PRIMARY KEY (id);


            --
            -- Name: questionnaire_script_report PK_f2d7c347433149e7f4a0ae1da0e; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.questionnaire_script_report
                ADD CONSTRAINT "PK_f2d7c347433149e7f4a0ae1da0e" PRIMARY KEY ("questionnaireScriptId", "reportId");


            --
            -- Name: department UQ_471da4b90e96c1ebe0af221e07b; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.department
                ADD CONSTRAINT "UQ_471da4b90e96c1ebe0af221e07b" UNIQUE (name);


            --
            -- Name: caregiver UQ_7483516d931f434dadc0112cf60; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.caregiver
                ADD CONSTRAINT "UQ_7483516d931f434dadc0112cf60" UNIQUE (phone);


            --
            -- Name: user UQ_78a916df40e02a9deb1c4b75edb; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public."user"
                ADD CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE (username);


            --
            -- Name: patient_caregiver UQ_d1984b08df9e3fba76965be4aa3; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.patient_caregiver
                ADD CONSTRAINT "UQ_d1984b08df9e3fba76965be4aa3" UNIQUE ("patientId", "caregiverId");


            --
            -- Name: role UQ_ee999bb389d7ac0fd967172c41f; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.role
                ADD CONSTRAINT "UQ_ee999bb389d7ac0fd967172c41f" UNIQUE (code);


            --
            -- Name: patient UQ_f5e2bc64979a1139ead31f4de6f; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.patient
                ADD CONSTRAINT "UQ_f5e2bc64979a1139ead31f4de6f" UNIQUE ("medicalRecordNo");


            --
            -- Name: disclaimer disclaimer_pkey; Type: CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.disclaimer
                ADD CONSTRAINT disclaimer_pkey PRIMARY KEY (type);


            --
            -- Name: IDX_013f9981d38eee99e524d8431b; Type: INDEX; Schema: public; Owner: default
            --

            CREATE INDEX "IDX_013f9981d38eee99e524d8431b" ON public.user_department USING btree ("userId");


            --
            -- Name: IDX_1401cd1dd854e226777e3b4fc2; Type: INDEX; Schema: public; Owner: default
            --

            CREATE INDEX "IDX_1401cd1dd854e226777e3b4fc2" ON public.patient_department USING btree ("patientId");


            --
            -- Name: IDX_275a8c948995619d309b03d292; Type: INDEX; Schema: public; Owner: default
            --

            CREATE INDEX "IDX_275a8c948995619d309b03d292" ON public.patient_case_manager USING btree ("userId");


            --
            -- Name: IDX_2ed07e4ed964953c7799206cf6; Type: INDEX; Schema: public; Owner: default
            --

            CREATE INDEX "IDX_2ed07e4ed964953c7799206cf6" ON public.user_department USING btree ("departmentId");


            --
            -- Name: IDX_6d65a158f4b7b750b2966f0eac; Type: INDEX; Schema: public; Owner: default
            --

            CREATE INDEX "IDX_6d65a158f4b7b750b2966f0eac" ON public.questionnaire_script_report USING btree ("reportId");


            --
            -- Name: IDX_72e80be86cab0e93e67ed1a7a9; Type: INDEX; Schema: public; Owner: default
            --

            CREATE INDEX "IDX_72e80be86cab0e93e67ed1a7a9" ON public.role_permission USING btree ("permissionId");


            --
            -- Name: IDX_a592f2df24c9d464afd71401ff; Type: INDEX; Schema: public; Owner: default
            --

            CREATE INDEX "IDX_a592f2df24c9d464afd71401ff" ON public.user_permission USING btree ("permissionId");


            --
            -- Name: IDX_aa473141a0ec650bce571d36b6; Type: INDEX; Schema: public; Owner: default
            --

            CREATE INDEX "IDX_aa473141a0ec650bce571d36b6" ON public.patient_case_manager USING btree ("patientId");


            --
            -- Name: IDX_ab40a6f0cd7d3ebfcce082131f; Type: INDEX; Schema: public; Owner: default
            --

            CREATE INDEX "IDX_ab40a6f0cd7d3ebfcce082131f" ON public.user_role USING btree ("userId");


            --
            -- Name: IDX_dba55ed826ef26b5b22bd39409; Type: INDEX; Schema: public; Owner: default
            --

            CREATE INDEX "IDX_dba55ed826ef26b5b22bd39409" ON public.user_role USING btree ("roleId");


            --
            -- Name: IDX_dbe4c661ea2447fb4c48befba9; Type: INDEX; Schema: public; Owner: default
            --

            CREATE INDEX "IDX_dbe4c661ea2447fb4c48befba9" ON public.questionnaire_script_report USING btree ("questionnaireScriptId");


            --
            -- Name: IDX_deb59c09715314aed1866e18a8; Type: INDEX; Schema: public; Owner: default
            --

            CREATE INDEX "IDX_deb59c09715314aed1866e18a8" ON public.user_permission USING btree ("userId");


            --
            -- Name: IDX_dfe51bc94484e59713aa9f35bb; Type: INDEX; Schema: public; Owner: default
            --

            CREATE INDEX "IDX_dfe51bc94484e59713aa9f35bb" ON public.report_role USING btree ("reportId");


            --
            -- Name: IDX_e3130a39c1e4a740d044e68573; Type: INDEX; Schema: public; Owner: default
            --

            CREATE INDEX "IDX_e3130a39c1e4a740d044e68573" ON public.role_permission USING btree ("roleId");


            --
            -- Name: IDX_e6491f20bfe6c21a708d362549; Type: INDEX; Schema: public; Owner: default
            --

            CREATE INDEX "IDX_e6491f20bfe6c21a708d362549" ON public.patient_department USING btree ("departmentId");


            --
            -- Name: IDX_e9df64b680b9a489f3b5b92499; Type: INDEX; Schema: public; Owner: default
            --

            CREATE INDEX "IDX_e9df64b680b9a489f3b5b92499" ON public.report_role USING btree ("roleId");


            --
            -- Name: user_department FK_013f9981d38eee99e524d8431bb; Type: FK CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.user_department
                ADD CONSTRAINT "FK_013f9981d38eee99e524d8431bb" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


            --
            -- Name: patient_caregiver FK_0db340ec8753c91db3dba218fd8; Type: FK CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.patient_caregiver
                ADD CONSTRAINT "FK_0db340ec8753c91db3dba218fd8" FOREIGN KEY ("caregiverId") REFERENCES public.caregiver(id);


            --
            -- Name: user_previous_password FK_1195e80c0f35054a84b1045c7c2; Type: FK CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.user_previous_password
                ADD CONSTRAINT "FK_1195e80c0f35054a84b1045c7c2" FOREIGN KEY ("userId") REFERENCES public."user"(id);


            --
            -- Name: patient_department FK_1401cd1dd854e226777e3b4fc2e; Type: FK CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.patient_department
                ADD CONSTRAINT "FK_1401cd1dd854e226777e3b4fc2e" FOREIGN KEY ("patientId") REFERENCES public.patient(id) ON DELETE CASCADE;


            --
            -- Name: patient_case_manager FK_275a8c948995619d309b03d2920; Type: FK CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.patient_case_manager
                ADD CONSTRAINT "FK_275a8c948995619d309b03d2920" FOREIGN KEY ("userId") REFERENCES public."user"(id);


            --
            -- Name: user_department FK_2ed07e4ed964953c7799206cf64; Type: FK CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.user_department
                ADD CONSTRAINT "FK_2ed07e4ed964953c7799206cf64" FOREIGN KEY ("departmentId") REFERENCES public.department(id);


            --
            -- Name: patient FK_4f7642e83eac852c242b8422068; Type: FK CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.patient
                ADD CONSTRAINT "FK_4f7642e83eac852c242b8422068" FOREIGN KEY ("statusId") REFERENCES public.patient_status(id);


            --
            -- Name: questionnaire_script_report FK_6d65a158f4b7b750b2966f0eac5; Type: FK CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.questionnaire_script_report
                ADD CONSTRAINT "FK_6d65a158f4b7b750b2966f0eac5" FOREIGN KEY ("reportId") REFERENCES public.report(id) ON UPDATE CASCADE ON DELETE CASCADE;


            --
            -- Name: role_permission FK_72e80be86cab0e93e67ed1a7a9a; Type: FK CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.role_permission
                ADD CONSTRAINT "FK_72e80be86cab0e93e67ed1a7a9a" FOREIGN KEY ("permissionId") REFERENCES public.permission(id) ON DELETE CASCADE;


            --
            -- Name: access_token FK_9949557d0e1b2c19e5344c171e9; Type: FK CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.access_token
                ADD CONSTRAINT "FK_9949557d0e1b2c19e5344c171e9" FOREIGN KEY ("userId") REFERENCES public."user"(id);


            --
            -- Name: patient_caregiver FK_a4b2a1d0f22f3f2c38aaf18f9e4; Type: FK CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.patient_caregiver
                ADD CONSTRAINT "FK_a4b2a1d0f22f3f2c38aaf18f9e4" FOREIGN KEY ("patientId") REFERENCES public.patient(id) ON DELETE CASCADE;


            --
            -- Name: user_permission FK_a592f2df24c9d464afd71401ff6; Type: FK CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.user_permission
                ADD CONSTRAINT "FK_a592f2df24c9d464afd71401ff6" FOREIGN KEY ("permissionId") REFERENCES public.permission(id);


            --
            -- Name: patient_case_manager FK_aa473141a0ec650bce571d36b69; Type: FK CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.patient_case_manager
                ADD CONSTRAINT "FK_aa473141a0ec650bce571d36b69" FOREIGN KEY ("patientId") REFERENCES public.patient(id) ON DELETE CASCADE;


            --
            -- Name: user_role FK_ab40a6f0cd7d3ebfcce082131fd; Type: FK CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.user_role
                ADD CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


            --
            -- Name: emergency_contact FK_ce876c18cfee282fea8bcc5abc1; Type: FK CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.emergency_contact
                ADD CONSTRAINT "FK_ce876c18cfee282fea8bcc5abc1" FOREIGN KEY ("patientId") REFERENCES public.patient(id) ON DELETE CASCADE;


            --
            -- Name: informant FK_d51350d0437b8aec48e0abc94bd; Type: FK CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.informant
                ADD CONSTRAINT "FK_d51350d0437b8aec48e0abc94bd" FOREIGN KEY ("patientId") REFERENCES public.patient(id) ON DELETE CASCADE;


            --
            -- Name: user_role FK_dba55ed826ef26b5b22bd39409b; Type: FK CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.user_role
                ADD CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b" FOREIGN KEY ("roleId") REFERENCES public.role(id);


            --
            -- Name: questionnaire_script_report FK_dbe4c661ea2447fb4c48befba91; Type: FK CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.questionnaire_script_report
                ADD CONSTRAINT "FK_dbe4c661ea2447fb4c48befba91" FOREIGN KEY ("questionnaireScriptId") REFERENCES public.questionnaire_script(id) ON UPDATE CASCADE ON DELETE CASCADE;


            --
            -- Name: user_permission FK_deb59c09715314aed1866e18a81; Type: FK CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.user_permission
                ADD CONSTRAINT "FK_deb59c09715314aed1866e18a81" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


            --
            -- Name: report_role FK_dfe51bc94484e59713aa9f35bba; Type: FK CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.report_role
                ADD CONSTRAINT "FK_dfe51bc94484e59713aa9f35bba" FOREIGN KEY ("reportId") REFERENCES public.report(id) ON UPDATE CASCADE ON DELETE CASCADE;


            --
            -- Name: role_permission FK_e3130a39c1e4a740d044e685730; Type: FK CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.role_permission
                ADD CONSTRAINT "FK_e3130a39c1e4a740d044e685730" FOREIGN KEY ("roleId") REFERENCES public.role(id) ON UPDATE CASCADE ON DELETE CASCADE;


            --
            -- Name: patient_department FK_e6491f20bfe6c21a708d3625491; Type: FK CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.patient_department
                ADD CONSTRAINT "FK_e6491f20bfe6c21a708d3625491" FOREIGN KEY ("departmentId") REFERENCES public.department(id);


            --
            -- Name: informant FK_e97e1d5f4369c959a2079651736; Type: FK CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.informant
                ADD CONSTRAINT "FK_e97e1d5f4369c959a2079651736" FOREIGN KEY ("relationshipTypeId") REFERENCES public.relationship_type(id);


            --
            -- Name: report_role FK_e9df64b680b9a489f3b5b924992; Type: FK CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.report_role
                ADD CONSTRAINT "FK_e9df64b680b9a489f3b5b924992" FOREIGN KEY ("roleId") REFERENCES public.role(id);


            --
            -- Name: assessment FK_f8b8c1abf7db4a29db9beca52a0; Type: FK CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.assessment
                ADD CONSTRAINT "FK_f8b8c1abf7db4a29db9beca52a0" FOREIGN KEY ("patientId") REFERENCES public.patient(id) ON DELETE CASCADE;


            --
            -- Name: assessment FK_fd1fdcb990f1fd615cfbaf3b12a; Type: FK CONSTRAINT; Schema: public; Owner: default
            --

            ALTER TABLE ONLY public.assessment
                ADD CONSTRAINT "FK_fd1fdcb990f1fd615cfbaf3b12a" FOREIGN KEY ("clinicianId") REFERENCES public."user"(id);        


            --
            -- PostgreSQL database dump complete
            --

            `,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('nothing to do here');
    }
}
