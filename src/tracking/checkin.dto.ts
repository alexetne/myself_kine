import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from "class-validator";

export class CreateCheckinDto {
  @ApiProperty({ example: "2026-07-20" }) @IsDateString() local_date!: string;
  @ApiProperty({ example: "Europe/Paris" })
  @IsString()
  @Length(1, 64)
  timezone!: string;
  @ApiProperty({ minimum: 0, maximum: 10 })
  @IsInt()
  @Min(0)
  @Max(10)
  fatigue!: number;
  @ApiProperty({ minimum: 0, maximum: 10 })
  @IsInt()
  @Min(0)
  @Max(10)
  sleep_quality!: number;
  @ApiProperty({ minimum: 0, maximum: 10 })
  @IsInt()
  @Min(0)
  @Max(10)
  stress!: number;
  @ApiProperty({ minimum: 0, maximum: 10 })
  @IsInt()
  @Min(0)
  @Max(10)
  motivation!: number;
  @ApiPropertyOptional({ minimum: 0, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  discomfort?: number;
  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  comment?: string;
}
