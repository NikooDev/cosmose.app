import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { IpService } from '@App/services/ip.service';
import { from, map, switchMap } from 'rxjs';
import { redirectToHome } from '@App/utils/functions.utils';
import { collection, getDocs, query, where, Firestore } from '@angular/fire/firestore';

export const ipGuard: CanActivateFn = (route, state) => {
	const firestore = inject(Firestore);
	const ipService = inject(IpService);

	return ipService.getIp().pipe(
		switchMap(response => {
			const userIp = response.ip;

			const allowedIpsRef = collection(firestore, 'allowip');
			const q = query(allowedIpsRef, where('ip', '==', userIp));

			return from(getDocs(q)).pipe(
				map(querySnapshot => {
					if (!querySnapshot.empty) {
						const data = querySnapshot.docs[0].data() as { allow: boolean };

						if (data.allow) {
							return true;
						} else {
							redirectToHome();
							return false;
						}
					} else {
						redirectToHome();
						return false;
					}
				})
			);
		})
	);
};
