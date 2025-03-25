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
	const q = query(roomsRef, where('roomID', '==', roomID));

	try {
		const querySnapshot = await getDocs(q);

		if (querySnapshot.empty) {
			return false;
		}

		return querySnapshot.docs[0].data();
	} catch (error) {
		redirectToHome(1);
		return false;
	}
};
