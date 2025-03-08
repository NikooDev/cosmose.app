import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { collection, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { environment } from '@/environments/environment';

export const roomGuard: CanActivateFn = async (route, _) => {
	const roomID = route.queryParams['roomID'];

	if (!roomID) {
		window.location.href = environment.production ? 'https://cosmose.vercel.app/?room=0' : 'http://localhost:3000/?room=0';
		return false;
	}

	const firestore = inject(Firestore);

	const roomsRef = collection(firestore, 'rooms');
	const q = query(roomsRef, where('roomID', '==', roomID));

	try {
		const querySnapshot = await getDocs(q);

		if (querySnapshot.empty) {
			window.location.href = environment.production ? 'https://cosmose.vercel.app/?room=0' : 'http://localhost:3000/?room=0';
			return false;
		}

		return true;
	} catch (error) {
		console.error('Erreur de connexion à Firestore:', error);
		window.location.href = 'https://cosmose.vercel.app/?room=1';
		return false;
	}
};
