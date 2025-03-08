import { animate, style, transition, trigger } from '@angular/animations';

export const fade = trigger('fade', [
	transition(':enter', [
		style({ opacity: 0 }),
		animate('0.2s ease-in', style({ opacity: 1 }))
	]),
	transition(':leave', [
		style({ opacity: 1 }),
		animate('0.2s ease-out', style({ opacity: 0 }))
	])
]);

export const slideInDown = trigger('slideInDown', [
	transition(':enter', [
		style({ opacity: 0, transform: 'translateY(-64px)' }),
		animate('0.3s ease-in-out', style({ opacity: 1, transform: 'translateY(0px)' }))
	]),
	transition(':leave', [
		style({ opacity: 1, transform: 'translateY(0)' }),
		animate('0.3s ease-out', style({ opacity: 0, transform: 'translateY(-64px)' }))
	])
]);
