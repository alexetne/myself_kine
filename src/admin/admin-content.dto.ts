import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsObject, IsString, IsUUID, Length } from "class-validator";

export class CreateExerciseDto {
  @ApiProperty({ example: "calf-raise" })
  @IsString()
  @Length(3, 80)
  slug!: string;
  @ApiProperty({ example: "Élévation du mollet" })
  @IsString()
  @Length(3, 160)
  title!: string;
  @ApiProperty() @IsObject() body!: Record<string, unknown>;
}

export class PublishExerciseVersionDto {
  @ApiProperty() @IsUUID() version_id!: string;
  @ApiProperty({
    description:
      "Identité professionnelle interne du validateur, pas une donnée saisie par un utilisateur.",
  })
  @IsString()
  @Length(3, 160)
  validator_reference!: string;
}

export class ChangeContentStatusDto {
  @ApiProperty({ enum: ["archived", "disabled"] })
  @IsIn(["archived", "disabled"])
  status!: "archived" | "disabled";
  @ApiProperty() @IsString() @Length(3, 500) reason!: string;
}
