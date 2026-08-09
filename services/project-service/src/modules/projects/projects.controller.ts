import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Headers } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { HeaderAuthGuard } from './guards/header-auth.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectsDto } from './dto/query-projects.dto';

@Controller('projects')
@UseGuards(HeaderAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(
    @Headers('x-user-id') userId: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateProjectDto,
  ) {
    const project = await this.projectsService.create(tenantId, userId, dto);
    return { project, message: 'Project created successfully' };
  }

  @Get()
  async findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: QueryProjectsDto,
  ) {
    const projects = await this.projectsService.findAll(tenantId, query);
    return { items: projects, total: projects.length };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-role') userRole: string,
  ) {
    const project = await this.projectsService.findOne(id, tenantId, userRole);
    return { project };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: UpdateProjectDto,
  ) {
    const project = await this.projectsService.update(id, tenantId, dto);
    return { project, message: 'Project updated successfully' };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    await this.projectsService.remove(id, tenantId);
    return { message: 'Project deleted successfully' };
  }
}
