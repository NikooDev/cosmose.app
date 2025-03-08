import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	inject, OnDestroy,
	OnInit,
	signal,
	WritableSignal
} from '@angular/core';
import { AsyncPipe, NgClass, NgIf, NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { CardComponent } from '@Cosmose/ui/card/card.component';
import { BehaviorSubject, Subscription } from 'rxjs';
import { fade } from '@/app/utils/animations';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '@/app/services/user.service';
import { ErrorAuth } from '@/app/types/firebase';
import { ActivatedRoute, Router } from '@angular/router';
import { isEmailRegex } from '@/app/utils/constantes';
import { RoleUserEnum } from '@/app/types/user';

@Component({
  selector: 'app-auth',
	imports: [
		NgOptimizedImage,
		NgClass,
		CardComponent,
		NgIf,
		AsyncPipe,
		NgTemplateOutlet,
		FormsModule,
		ReactiveFormsModule
	],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
	animations: [fade],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthComponent implements OnInit, OnDestroy {
	public signupForm!: FormGroup;

	public loginForm!: FormGroup;

	public error?: ErrorAuth;

	public roomID: string | null = null;

	public pending: WritableSignal<boolean> = signal(false);

	private subscriptions: Subscription[] = [];

	public isSignup$: BehaviorSubject<boolean> = new BehaviorSubject(true);

	public inputClass = 'w-full h-11 text-slate-800 rounded-2xl px-3 font-NexaHeavy hover:!bg-theme-100 focus:!bg-theme-100 transition-colors duration-200';

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

	protected readonly ErrorAuth = ErrorAuth;

	private formBuilder = inject(FormBuilder);
	private userService = inject(UserService);
	private cdr = inject(ChangeDetectorRef);
	private route = inject(ActivatedRoute);
	private router = inject(Router);

	public showForm: BehaviorSubject<boolean> = new BehaviorSubject(false);

	ngOnInit() {
		this.initRoom();
		this.initForm();

		setTimeout(() => {
			this.showForm.next(true);
		}, 50);
	}

	ngOnDestroy() {
		this.subscriptions.forEach(subscription => subscription.unsubscribe());
	}

	private initRoom() {
		const route$ = this.route.data.subscribe((data) => {
			console.log(data);
		});

		this.subscriptions.push(route$);
	}

	private initForm(): void {
		this.signupForm = this.formBuilder.group({
			lastname: ['', [Validators.required]],
			firstname: ['', [Validators.required]],
			email: ['', [Validators.pattern(isEmailRegex), Validators.required]],
			password: ['', [Validators.required]]
		});
		this.loginForm = this.formBuilder.group({
			email: ['', [Validators.pattern(isEmailRegex), Validators.required]],
			password: ['', [Validators.required]]
		});

		const loginForm$ = this.loginForm.valueChanges.subscribe(() => { delete this.error; });
		const signupForm$ = this.signupForm.valueChanges.subscribe(() => { delete this.error; });

		this.subscriptions.push(loginForm$, signupForm$);
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

	public toggleIsSignup(event: Event, value: boolean) {
		event.preventDefault();

		this.isSignup$.next(value);
	}

	public async submit(isSubmit: boolean) {
		this.error = undefined;
		this.pending.set(true);

		if (isSubmit) {
			this.signupForm.markAllAsTouched();
		} else {
			this.loginForm.markAllAsTouched();

			const email = this.loginForm.get('email')?.value as string;
			const password = this.loginForm.get('password')?.value as string;

			if (!email || !password) {
				this.pending.set(false);
				return;
			}

			await this.delay(1000);

			try {
				this.cdr.markForCheck();
				await this.userService.login(email, password);

				this.userService.user$.subscribe(async user => {
					if (user) {
						if (user.role.includes(RoleUserEnum.ADMIN)) {
							await this.router.navigate(['/admin/dashboard']);
						} else if (user.role.includes(RoleUserEnum.USER)) {
							await this.router.navigate(['/app']);
						}
					}
				});
			} catch (error) {

			}
		}
	}

	private delay(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}
