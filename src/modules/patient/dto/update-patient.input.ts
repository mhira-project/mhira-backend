import { InputType, OmitType } from "@nestjs/graphql";
import { CreatePatientInput } from "./create-patient.input";

@InputType()
export class UpdatePatientInput extends CreatePatientInput {

}
