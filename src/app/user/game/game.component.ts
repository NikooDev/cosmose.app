import {
	Component,
	effect, ElementRef,
	inject,
	OnDestroy,
	OnInit,
	signal,
	ViewChild,
	WritableSignal
} from '@angular/core';
import {RoomComponent} from '@App/user/room/room.component';
import {redirectToHome} from '@App/utils/functions.utils';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {CardComponent} from '@App/ui/card/card.component';
import {ButtonComponent} from '@App/ui/button/button.component';
import {fade, scaleIn, slideInDown} from '@App/utils/animations.utils';
import {UserService} from '@App/services/user.service';
import {WebcamModule} from 'ngx-webcam';
import {NgClass, NgIf, NgOptimizedImage} from '@angular/common';
import {SwitchComponent} from '@App/ui/switch/switch.component';
import {LoaderComponent} from '@App/ui/loader/loader.component';

@Component({
  selector: 'app-game',
	imports: [
		RoomComponent,
		CardComponent,
		ButtonComponent,
		WebcamModule,
		NgOptimizedImage,
		NgIf,
		SwitchComponent,
		LoaderComponent,
		NgClass
	],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
	animations: [fade, scaleIn, slideInDown]
})
export class GameComponent implements OnInit, OnDestroy {
	public roomID!: string | undefined;

	public company!: string | undefined;

	public $ready: WritableSignal<boolean> = signal(false);

	public $started: WritableSignal<boolean> = signal(false);

	public $isReady: WritableSignal<boolean> = signal(false);

	public $counter: WritableSignal<number> = signal(10);

	private route = inject(ActivatedRoute);

	private router = inject(Router);

	private userService = inject(UserService);

	private subscriptions: Subscription[] = [];

	@ViewChild('beepAudio')
	public beepAudioRef!: ElementRef<HTMLAudioElement>;

	intervalId: any;

	constructor() {
		effect(() => {
			const isReady = this.$isReady();

			if (isReady) {
				this.startCountdown();
			}
		});
	}

	ngOnInit() {
		this.initRoom();
	}

	ngOnDestroy() {
		if (this.intervalId) {
			clearInterval(this.intervalId);
		}
		this.subscriptions.forEach(subscription => subscription.unsubscribe());
	}

	public startCountdown(): void {
		this.$counter.set(10);
		this.intervalId = setInterval(async () => {
			const current = this.$counter();

			const audio = this.beepAudioRef.nativeElement;
			audio.currentTime = 0;
			await audio.play();

			this.$counter.set(current - 1);

			if (current <= 1) {
				clearInterval(this.intervalId);
				this.$ready.set(false);
				this.$isReady.set(false);
				this.$started.set(true);
			}
		}, 1000);
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

	public onReady(value: boolean) {
		this.$isReady.set(value);

		if (!value) {
			clearInterval(this.intervalId);
		}
	}

	public async logout(event: MouseEvent) {
		event.preventDefault();

		await this.userService.logout();
		await this.router.navigate(['/']);
	}
}
