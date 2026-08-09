import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Headers, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { HeaderAuthGuard } from './guards/header-auth.guard';
import { UserRole } from './entities/user-role.enum';

/**
 * Controlador de usuarios con vulnerabilidades intencionales:
 * - FALLA 2: Race condition en creación de usuarios (en el service)
 * - FALLA 3: Confía ciegamente en headers del API Gateway
 */
@Controller('users')
@UseGuards(HeaderAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * POST /users
   * Crea un nuevo usuario. Vulnerable a Race Condition (FALLA 2).
   */
  @Post()
  async create(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-role') userRole: string,
    @Body() createUserDto: CreateUserDto,
  ) {
    // Verificar que el email no exista ya en este tenant
    const existingUser = await this.usersService.findByEmail(createUserDto.email, tenantId);
    if (existingUser) {
      throw new BadRequestException('Email already exists in this tenant');
    }

    // ⚠️ La race condition ocurre dentro del servicio
    const user = await this.usersService.createUser(tenantId, createUserDto);

    return {
      user,
      message: `User created with role ${user.role}`,
    };
  }

  /**
   * GET /users
   * Lista usuarios del tenant. Vulnerable si x-tenant-id es manipulado.
   */
  @Get()
  async findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query() queryDto: QueryUsersDto,
  ) {
    const result = await this.usersService.findAll(
      tenantId,
      queryDto.page,
      queryDto.limit,
      queryDto.role,
      queryDto.search,
    );

    return {
      data: result.data,
      pagination: {
        page: queryDto.page,
        limit: queryDto.limit,
        total: result.total,
      },
    };
  }

  /**
   * GET /users/:id
   * Obtiene un usuario por ID. Vulnerable si x-user-role es ADMIN falsificado.
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-role') userRole: string,
  ) {
    // ⚠️ VULNERABILIDAD: Si el rol es ADMIN, permite acceso sin verificar tenant correctamente
    let user;
    
    if (userRole === UserRole.ADMIN || userRole === UserRole.OWNER) {
      // Admin puede ver cualquier usuario (pero aún debería verificar tenant)
      user = await this.usersService.findOne(id, tenantId);
    } else {
      // Miembro solo puede verse a sí mismo o usuarios de su tenant
      user = await this.usersService.findOne(id, tenantId);
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { user };
  }

  /**
   * PUT /users/:id
   * Actualiza un usuario. Vulnerable: permite auto-modificación de role.
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    // ⚠️ VULNERABILIDAD SECUNDARIA: Si el usuario autenticado coincide con el :id,
    // puede modificar su propio campo "role" sin verificación adicional
    const isSelfUpdate = userId === id;
    
    // Si intenta cambiar el rol y no es admin/owner, rechazar
    if (updateUserDto.role && userRole !== UserRole.ADMIN && userRole !== UserRole.OWNER) {
      if (isSelfUpdate) {
        // ⚠️ Pero si ES self-update, permitirlo (vulnerabilidad)
        // Un usuario MEMBER podría elevarse a ADMIN modificando su propio role
      }
    }

    const user = await this.usersService.update(id, tenantId, updateUserDto);
    
    return { user, message: 'User updated successfully' };
  }

  /**
   * DELETE /users/:id
   * Elimina un usuario. Requiere rol ADMIN u OWNER.
   */
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-role') userRole: string,
  ) {
    // ⚠️ VULNERABILIDAD: Confía en x-user-role sin re-validar contra BD
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.OWNER) {
      throw new ForbiddenException('Only ADMIN or OWNER can delete users');
    }

    await this.usersService.remove(id, tenantId);
    
    return { message: 'User deleted successfully' };
  }
}
