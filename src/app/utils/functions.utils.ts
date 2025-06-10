import { environment } from '@/environments/environment';
import {Router} from '@angular/router';
import {inject} from '@angular/core';

String.prototype.cap = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
};

export const delay = (ms: number): { id: number, promise: Promise<void> } => {
	let timeoutID: number;

	const promise = new Promise<void>(resolve => {
		timeoutID = window.setTimeout(resolve, ms);
	});

	return { promise, id: timeoutID! };
}

export const redirectToHome = (errorCode?: number) => {
	if (typeof errorCode !== 'undefined') {
		const eCode = errorCode.toString();

		return window.location.href = environment.production
			? `https://cosmose.vercel.app/?error=${eCode}`
			: `http://localhost:3000/?error=${eCode}`;
	} else {
		return window.location.href = environment.production
			? 'https://cosmose.vercel.app/'
			: 'http://localhost:3000/';
	}
}
