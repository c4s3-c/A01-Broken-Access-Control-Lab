import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ProjectStatus } from './create-project.dto';

export class QueryProjectsDto {
  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 20;

  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @IsString()
  @IsOptional()
  search?: string;
}
