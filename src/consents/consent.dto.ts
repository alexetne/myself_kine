import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsUUID } from "class-validator";

export class RecordConsentDto {
  @ApiProperty({ format: "uuid" }) @IsUUID() definition_id!: string;
  @ApiProperty() @IsBoolean() granted!: boolean;
}
