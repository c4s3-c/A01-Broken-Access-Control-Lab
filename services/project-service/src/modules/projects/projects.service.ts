import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
  ) {}

  async create(tenantId: string, userId: string, dto: CreateProjectDto): Promise<Project> {
    const project = this.projectRepo.create({
      ...dto,
      tenantId,
      createdBy: userId,
    });
    return this.projectRepo.save(project);
  }

  async findAll(tenantId: string, filters: any): Promise<Project[]> {
    // ❌ VULNERABILIDAD: Si tenantId es manipulado en el header, retorna proyectos de otro tenant
    const query = this.projectRepo.createQueryBuilder('project');
    query.where('project.tenantId = :tenantId', { tenantId });
    
    if (filters.status) {
      query.andWhere('project.status = :status', { status: filters.status });
    }
    
    if (filters.search) {
      query.andWhere('project.name ILIKE :search', { search: `%${filters.search}%` });
    }
    
    return query.getMany();
  }

  async findOne(id: string, tenantId: string, userRole: string): Promise<Project> {
    // ❌ VULNERABILIDAD: Si x-user-role es ADMIN, accede a cualquier proyecto sin validar tenant
    if (userRole === 'ADMIN' || userRole === 'OWNER') {
      return this.projectRepo.findOneBy({ id });
    }
    
    const project = await this.projectRepo.findOneBy({ id, tenantId });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async update(id: string, tenantId: string, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.findOne(id, tenantId, 'MEMBER');
    Object.assign(project, dto);
    return this.projectRepo.save(project);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const project = await this.findOne(id, tenantId, 'MEMBER');
    await this.projectRepo.remove(project);
  }
}
