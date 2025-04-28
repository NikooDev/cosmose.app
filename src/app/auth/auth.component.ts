import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NgClass, NgIf, NgOptimizedImage } from '@angular/common';
import { SignupComponent } from '@App/auth/signup/signup.component';
import { LoginComponent } from '@App/auth/login/login.component';
import { ComponentBase } from '@App/base/component.base';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FirstletterPipe } from '@App/pipes/firstletter.pipe';
import { FooterComponent } from '@App/ui/footer/footer.component';
import { redirectToHome } from '@App/utils/functions.utils';

@Component({
  selector: 'app-auth',
	imports: [
		NgOptimizedImage,
		SignupComponent,
		LoginComponent,
		FirstletterPipe,
		NgClass,
		NgIf,
		FooterComponent
	],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent extends ComponentBase implements OnInit, OnDestroy {
	public images = [
		{ src: '/img/home/image1.jpg', animated: false, width: 150, height: 100 },
		{ src: '/img/home/image2.jpg', animated: true, width: 264, height: 176 },
		{ src: '/img/home/image3.jpg', animated: true, width: 231, height: 154 },
		{ src: '/img/home/image4.jpg', animated: false, width: 177, height: 118 },
		{ src: '/img/home/image5.jpg', animated: true, width: 193, height: 128 },
		{ src: '/img/home/image6.jpg', animated: false, width: 233, height: 154 },
		{ src: '/img/home/image7.jpg', animated: true, width: 294, height: 196 },
		{ src: '/img/home/image8.jpg', animated: true, width: 158, height: 105 }
	]

	public background!: string;

	public isSignup = true;

	public roomID!: string | undefined;

	public company!: string | undefined;

	private router = inject(Router);

	private route = inject(ActivatedRoute);

	private subscriptions: Subscription[] = [];

	constructor() {
		super();
	}

	ngOnInit() {
		this.initRoom();
	}

	ngOnDestroy() {
		this.subscriptions.forEach(subscription => subscription.unsubscribe());
	}

	public initRoom() {
		const route$ = this.route.data.subscribe(({ room }) => {
			if (!room.roomID && !room.company) {
				setTimeout(() => {
					redirectToHome(0);
				}, 1000);
				return;
			}

			this.background = room.pictureURL;

			this.roomID = room.roomID;
			this.company = room.company;
		});

		this.subscriptions.push(route$);
	}

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

	public toggleView(event: MouseEvent) {
		event.preventDefault();
		this.isSignup = !this.isSignup;
	}
}
