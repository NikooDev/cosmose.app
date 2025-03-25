import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { RoleUserEnum } from '@App/types/user';
import { inject } from '@angular/core';
import { UserService } from '@App/services/user.service';

export const adminLoggedGuard: CanActivateFn = (route, state) => {
	const userService = inject(UserService);
	const router = inject(Router);

	return userService.user$.pipe(
		take(1),
		map(user => {
			if (user) {
				if (user.role.some(role => [RoleUserEnum.ADMIN, RoleUserEnum.SUPERADMIN].includes(role))) {
					router.navigate(['/admin/dashboard']).then();
					return false;
				}

				return true;
			} else {
				return true;
			}
		})
	) ?? false;
};
