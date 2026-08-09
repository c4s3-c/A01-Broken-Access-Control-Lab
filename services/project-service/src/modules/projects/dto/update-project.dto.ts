import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ProjectStatus } from './create-project.dto';

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;
}
