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

export const scaleIn = trigger('scaleIn', [
	transition(':enter', [
		style({ opacity: 0, transform: 'scale(0)' }),
		animate('0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)', style({ opacity: 1, transform: 'scale(1)' }))
	])
]);

export const slideInDown = trigger('slideInDown', [
	transition(':enter', [
		style({ opacity: 0, transform: 'translateY(100%)' }),
		animate(
			'1s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
			style({ opacity: 1, transform: 'translateY(0)' })
		)
	])
]);
