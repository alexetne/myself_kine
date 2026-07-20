import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsDefined,
  IsString,
  Length,
  ValidateNested,
} from "class-validator";

export class QuestionnaireAnswerDto {
  @ApiProperty({ example: "synthetic_orientation" })
  @IsString()
  @Length(1, 100)
  question_id!: string;

  @ApiProperty({ example: "synthetic_clear" })
  @IsDefined()
  value!: unknown;
}

export class SubmitQuestionnaireDto {
  @ApiProperty({ type: [QuestionnaireAnswerDto] })
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => QuestionnaireAnswerDto)
  answers!: QuestionnaireAnswerDto[];
}
