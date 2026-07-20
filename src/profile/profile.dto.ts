import { ApiProperty } from "@nestjs/swagger";
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsObject,
  IsString,
  Max,
  Min,
} from "class-validator";

export class UpsertProfileDto {
  @ApiProperty({ example: 1990 })
  @IsInt()
  @Min(1900)
  @Max(2008)
  birth_year!: number;
  @ApiProperty({ example: ["road", "trail"] })
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  practices!: string[];
  @ApiProperty({ enum: ["beginner", "regular", "experienced"] })
  @IsIn(["beginner", "regular", "experienced"])
  level!: string;
  @ApiProperty({ enum: ["prevention", "strength", "return_after_break"] })
  @IsIn(["prevention", "strength", "return_after_break"])
  goal!: string;
  @ApiProperty({ example: { monday: 45 } })
  @IsObject()
  weekly_availability!: Record<string, number>;
  @ApiProperty({ example: ["mat", "elastic_band"] })
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  equipment!: string[];
}
