import { IsArray, IsString } from 'class-validator';

export class BulkDeleteDto {
  @IsArray()
  @IsString({ each: true })
  projectIds: string[];
}
