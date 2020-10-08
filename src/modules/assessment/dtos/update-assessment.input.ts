import { InputType, PartialType } from "@nestjs/graphql";
import { CreateAssessmentInput } from "./create-assessment.input";

@InputType()
export class UpdateAssessmentInput extends PartialType(CreateAssessmentInput) {

}
