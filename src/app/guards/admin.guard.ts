import { CanActivateChildFn } from '@angular/router';
import { inject } from '@angular/core';
import { map, take } from 'rxjs';
import { redirectToHome } from '@App/utils/functions.utils';
import { UserService } from '@App/services/user.service';
import { RoleUserEnum } from '@App/types/user';

export const adminGuard: CanActivateChildFn = (route, state) => {
	const userService = inject(UserService);

	return userService.user$.pipe(
		take(1),
		map(user => {
			if (user) {
				return user.role.some(role => [RoleUserEnum.ADMIN, RoleUserEnum.SUPERADMIN].includes(role));
			} else {
				redirectToHome();
				return false;
			}
		})
	) ?? false;
};
