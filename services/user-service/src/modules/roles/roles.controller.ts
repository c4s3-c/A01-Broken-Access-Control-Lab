import { Controller, Post, Body, UseGuards, Headers, ForbiddenException } from '@nestjs/common';
import { RolesService } from './roles.service';
import { AssignRoleDto } from './dto/assign-role.dto';
import { HeaderAuthGuard } from '../users/guards/header-auth.guard';
import { UserRole } from '../users/entities/user-role.enum';

@Controller('roles')
@UseGuards(HeaderAuthGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post('assign')
  async assignRole(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
    @Body() assignRoleDto: AssignRoleDto,
  ) {
    // Solo ADMIN u OWNER pueden asignar roles
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.OWNER) {
      throw new ForbiddenException('Only ADMIN or OWNER can assign roles');
    }

    await this.rolesService.assignRole(
      assignRoleDto.userId,
      tenantId,
      assignRoleDto.role,
      userId,
    );

    return { message: 'Role assigned successfully' };
  }

  @Post('revoke')
  async revokeRole(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
    @Body() body: { userId: string },
  ) {
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.OWNER) {
      throw new ForbiddenException('Only ADMIN or OWNER can revoke roles');
    }

    await this.rolesService.revokeRole(body.userId, tenantId);

    return { message: 'Role revoked successfully' };
  }
}
