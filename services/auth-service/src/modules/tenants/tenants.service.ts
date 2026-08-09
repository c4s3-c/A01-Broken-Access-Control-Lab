import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async findById(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { id } });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    return tenant;
  }

  async findBySlug(slug: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { slug } });

    if (!tenant) {
      throw new NotFoundException(`Tenant with slug ${slug} not found`);
    }

    return tenant;
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.find();
  }

  async createTenant(tenantData: Partial<Tenant>): Promise<Tenant> {
    const tenant = this.tenantRepository.create(tenantData);
    return this.tenantRepository.save(tenant);
  }

  async updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant> {
    await this.tenantRepository.update(id, updates);
    return this.findById(id);
  }

  async deleteTenant(id: string): Promise<void> {
    await this.tenantRepository.delete(id);
  }
}
