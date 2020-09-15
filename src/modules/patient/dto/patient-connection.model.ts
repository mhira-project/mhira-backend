import { ObjectType } from "@nestjs/graphql";
import { Paginated } from "src/shared/pagination/types/paginated";
import { Patient } from "../models/patient.model";


@ObjectType()
export class PatientConnection extends Paginated(Patient) { }
