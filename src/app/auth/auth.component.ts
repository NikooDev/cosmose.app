import { Component } from '@angular/core';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { CardComponent } from '@Cosmose/ui/card/card.component';

@Component({
  selector: 'app-auth',
	imports: [
		NgOptimizedImage,
		NgClass,
		CardComponent
	],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
	public images = [
		{ src: '/img/home/image1.jpg', animated: false, width: 150, height: 100, style: { top: '-7.3rem', left: '12rem' } },
		{ src: '/img/home/image2.jpg', animated: true, width: 264, height: 176, style: { top: '0', left: '0' } },
		{ src: '/img/home/image3.jpg', animated: true, width: 231, height: 154, style: { top: '-3.5rem', left: '29.5rem' } },
		{ src: '/img/home/image4.jpg', animated: false, width: 177, height: 118, style: { top: '-6rem', left: '22.4rem' } },
		{ src: '/img/home/image5.jpg', animated: true, width: 193, height: 128, style: { top: '13.5rem', left: '26rem', zIndex: 1 } },
		{ src: '/img/home/image6.jpg', animated: false, width: 233, height: 154, style: { top: '12.1rem', left: '7.9rem' } },
		{ src: '/img/home/image7.jpg', animated: true, width: 294, height: 196, style: { left: '17.5rem', top: '2.5rem' } },
		{ src: '/img/home/image8.jpg', animated: true, width: 158, height: 105, style: { top: '9.5rem', left: '-3rem' } }
	]

	public getAnimateClass(index: number, animated: boolean): string | null {
		return animated ? `animate-float-${index}` : null;
	}

	public onLoadImage(event: Event, index: number) {
		const currentTarget = event.currentTarget as HTMLImageElement;

		setTimeout(() => {
			currentTarget.classList.add('loaded');
			currentTarget.parentElement?.classList.add('loaded');
		}, 100 * index);
	}
}
