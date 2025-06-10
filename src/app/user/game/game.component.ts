import {Component, inject, OnDestroy, OnInit, signal, WritableSignal} from '@angular/core';
import {RoomComponent} from '@App/user/room/room.component';
import {redirectToHome} from '@App/utils/functions.utils';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {CardComponent} from '@App/ui/card/card.component';
import {ButtonComponent} from '@App/ui/button/button.component';
import {fade, scaleIn, slideInDown} from '@App/utils/animations.utils';
import {UserService} from '@App/services/user.service';
import {WebcamModule} from 'ngx-webcam';
import {NgIf, NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-game',
	imports: [
		RoomComponent,
		CardComponent,
		ButtonComponent,
		WebcamModule,
		NgOptimizedImage,
		NgIf
	],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
	animations: [fade, scaleIn, slideInDown]
})
export class GameComponent implements OnInit, OnDestroy {
	public roomID!: string | undefined;

	public company!: string | undefined;

	public $ready: WritableSignal<boolean> = signal(false);

	private route = inject(ActivatedRoute);

	private router = inject(Router);

	private userService = inject(UserService);

	private subscriptions: Subscription[] = [];

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

			this.roomID = room.roomID;
			this.company = room.company;
		});

		this.subscriptions.push(route$);
	}

	public initGame() {
		this.$ready.set(true);
	}

	public async logout(event: MouseEvent) {
		event.preventDefault();

		await this.userService.logout();
		await this.router.navigate(['/']);
	}
}
