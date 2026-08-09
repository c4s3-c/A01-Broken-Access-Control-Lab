import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * Servicio de usuarios con vulnerabilidad intencional de Race Condition (FALLA 2)
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  /**
   * ⚠️ VULNERABILIDAD INTENCIONAL (FALLA 2): Race Condition
   * 
   * Este método tiene una ventana de tiempo entre la verificación de si existe
   * un ADMIN y la creación del nuevo usuario. Si múltiples requests llegan
   * simultáneamente, todos pueden ver existingAdmin = null y crear usuarios ADMIN.
   * 
   * NO USAR transacciones ni bloqueos - eso rompería la vulnerabilidad del laboratorio.
   */
  async createUser(tenantId: string, userData: CreateUserDto): Promise<User> {
    // ❌ VULNERABILIDAD INTENCIONAL - NO CORREGIR
    // Paso 1: Verificar si el tenant ya tiene un ADMIN
    const existingAdmin = await this.userRepo.findOne({
      where: { tenantId, role: UserRole.ADMIN },
    });

    // ❌ VULNERABILIDAD: Ventana de tiempo entre verificación y creación
    // No hay transacción, no hay bloqueo, no hay atomicidad
    // Si 50 requests llegan simultáneamente, todos ven existingAdmin = null
    // Todos crean su usuario con rol ADMIN

    // Paso 2: Determinar el rol del nuevo usuario
    const role = existingAdmin ? UserRole.MEMBER : UserRole.ADMIN;

    // Paso 3: Crear y guardar el usuario
    const user = this.userRepo.create({
      ...userData,
      tenantId,
      role,
    });

    this.logger.log(`Creating user ${userData.email} with role ${role} for tenant ${tenantId}`);
    
    return this.userRepo.save(user);
  }

  async findAll(tenantId: string, page: number, limit: number, role?: string, search?: string): Promise<{ data: User[]; total: number }> {
    const queryBuilder = this.userRepo.createQueryBuilder('user')
      .where('user.tenantId = :tenantId', { tenantId });

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: string, tenantId: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id, tenantId },
    });
  }

  async update(id: string, tenantId: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepo.update(id, {
      ...updateUserDto,
      tenantId, // Mantener mismo tenant
    });

    const user = await this.userRepo.findOne({ where: { id, tenantId } });
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const result = await this.userRepo.delete({ id, tenantId });
    if (result.affected === 0) {
      throw new Error('User not found');
    }
  }

  async findByEmail(email: string, tenantId: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email, tenantId },
    });
  }
}
