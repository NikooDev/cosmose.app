import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import {collection, Firestore, getDocs, query, where, DocumentData, or, and} from '@angular/fire/firestore';
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
	const bConfirmed = query(
		bookingRef,
		and(
			where('roomID', '==', roomID),
			where('status', '==', 'confirmed')
		)
	);

	const bStarted = query(
		bookingRef,
		and(
			where('roomID', '==', roomID),
			where('status', '==', 'started')
		)
	);

	try {
		const queryQSnapshot = await getDocs(q);

		const [confirmedBookings, startedBookings] = await Promise.all([
			getDocs(bConfirmed),
			getDocs(bStarted),
		]);

		if (queryQSnapshot.empty) {
			return false;
		}

		if (confirmedBookings.empty && startedBookings.empty) {
			redirectToHome(2);
			return false;
		}

		let pictureURL: string | undefined = undefined;

		if (!confirmedBookings.empty) {
			const data = confirmedBookings.docs[0].data();
			pictureURL = data['activity'].pictureUrl;
		} else if (!startedBookings.empty) {
			const data = startedBookings.docs[0].data();
			pictureURL = data['activity'].pictureUrl;
		}

		return {
			pictureURL,
			...queryQSnapshot.docs[0].data(),
		};
	} catch (error) {
		redirectToHome(1);
		return false;
	}
};
