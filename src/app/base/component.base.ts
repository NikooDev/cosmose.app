import { ChangeDetectorRef, inject } from '@angular/core';
import { UserService } from '@App/services/user.service';
import { Observable } from 'rxjs';
import { UserEntity } from '@App/entities/user.entity';
import { RoleUserEnum } from '@App/types/user';

export abstract class ComponentBase {
	protected cdr = inject(ChangeDetectorRef);
	public userService = inject(UserService);

	public user$: Observable<UserEntity | null>;

	public adminRoles = [RoleUserEnum.ADMIN, RoleUserEnum.SUPERADMIN];
	public superAdminRoles = [RoleUserEnum.SUPERADMIN];
	public userRoles = [RoleUserEnum.USER];

	protected constructor() {
		this.user$ = this.userService.user$;
	}

	public hasRole(roles: RoleUserEnum[], userRoles: RoleUserEnum[]): boolean {
		return roles.some(role => userRoles && userRoles.includes(role as RoleUserEnum));
	}
}
