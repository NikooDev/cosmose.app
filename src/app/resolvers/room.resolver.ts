import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { collection, Firestore, getDocs, query, where, DocumentData } from '@angular/fire/firestore';
import { redirectToHome } from '@App/utils/functions.utils';

export const roomResolver: ResolveFn<DocumentData> = async (route, _) => {
	const roomID = route.queryParams['roomID'];

	if (!roomID) {
		redirectToHome();
		return false;
	}

	const firestore = inject(Firestore);

	const roomsRef = collection(firestore, 'rooms');
	const bookingRef = collection(firestore, 'bookings');
	const q = query(roomsRef, where('roomID', '==', roomID));
	const b = query(
		bookingRef,
		where('status', '==', 'confirmed'),
		where('roomID', '==', roomID)
	);

	try {
		const queryQSnapshot = await getDocs(q);
		const queryBSnapshot = await getDocs(b);

		if (queryBSnapshot.empty) {
			redirectToHome(2);
			return false;
		}

		if (queryQSnapshot.empty) {
			return false;
		}

		return queryQSnapshot.docs[0].data();
	} catch (error) {
		redirectToHome(1);
		return false;
	}
};
