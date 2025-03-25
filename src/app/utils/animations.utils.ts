import { animate, style, transition, trigger } from '@angular/animations';

export const element = trigger('element', [
	transition(':enter', [
		style({ opacity: 0, transform: 'translateY(30px)' }),
		animate('0.3s ease-in-out', style({ opacity: 1, transform: 'translateY(0px)' }))
	])
]);

export const fade = trigger('fade', [
	transition(':enter', [
		style({ opacity: 0 }),
		animate('0.3s ease-in-out', style({ opacity: 1 }))
	])
]);
