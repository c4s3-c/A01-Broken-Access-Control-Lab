import { IsOptional, IsString } from 'class-validator';

export class ExportDataDto {
  @IsOptional()
  @IsString()
  format?: string;
}
