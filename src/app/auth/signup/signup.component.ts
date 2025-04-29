import {
	ChangeDetectionStrategy,
	Component,
	inject,
	Input,
	OnDestroy,
	OnInit,
	signal,
	WritableSignal
} from '@angular/core';
import {CardComponent} from '@App/ui/card/card.component';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgIf, NgOptimizedImage} from '@angular/common';
import {inputStyleNexa, isEmailRegex} from '@App/utils/constantes.utils';
import {ButtonComponent} from '@App/ui/button/button.component';
import {UserEntity} from '@App/entities/user.entity';
import {ToastService} from '@App/services/toast.service';
import {ToastTypeEnum} from '@App/types/ui';
import {UserService} from '@App/services/user.service';
import {RoleUserEnum, StatusUserEnum} from '@App/types/user';
import {Subscription, switchMap, throwError} from 'rxjs';
import {delay} from '@App/utils/functions.utils';
import {LoaderComponent} from '@App/ui/loader/loader.component';

@Component({
  selector: 'app-signup',
	imports: [
		CardComponent,
		ReactiveFormsModule,
		NgOptimizedImage,
		ButtonComponent,
		LoaderComponent,
		NgIf
	],
  templateUrl: './signup.component.html',
  styleUrl: './../auth.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignupComponent implements OnInit, OnDestroy {
	@Input()
	public toggleView!: (event: MouseEvent) => void;

	@Input()
	public company!: string;

	@Input()
	public roomID!: string;

	public $pending: WritableSignal<boolean> = signal(false);

	public signupForm!: FormGroup;

	private formBuilder = inject(FormBuilder);

	private toastService = inject(ToastService);

	private userService = inject(UserService);

	private subscriptions: Subscription[] = [];

	protected readonly inputStyle= inputStyleNexa;

	ngOnInit() {
		this.initForm();
	}

	ngOnDestroy() {
		this.subscriptions.forEach(subscription => subscription.unsubscribe());
	}

	public initForm() {
		this.signupForm = this.formBuilder.group({
			lastname: ['', [Validators.required]],
			firstname: ['', [Validators.required]],
			email: ['', [Validators.pattern(isEmailRegex), Validators.required]],
			password: ['', [Validators.required]]
		});
	}

	public async submit() {
		const user = this.signupForm.getRawValue() as UserEntity & { password: string };

		if (user.email) {
			if (!isEmailRegex.test(user.email)) {
				this.toastService.open(ToastTypeEnum.ERROR, 'Votre adresse email est invalide.');
				return;
			}
		}

		this.$pending.set(true);

		const { promise } = delay(2000);
		await promise;

		try {
			const createUser$ = this.userService.createUser(user.email, user.password).pipe(
				switchMap((result) => {
					if (result.success) {
						return this.userService.create({
							uid: result.uid,
							firstname: user.firstname.trim(),
							lastname: user.lastname.trim(),
							email: user.email.trim(),
							status: StatusUserEnum.OFFLINE,
							role: [RoleUserEnum.USER],
							revoked: false,
							roomID: this.roomID,
							company: this.company
						});
					} else {
						return throwError(() => new Error('Failed to create admin in Firebase Auth'));
					}
				})
			).subscribe({
				next: () => {
					this.toastService.open(ToastTypeEnum.SUCCESS, 'Votre compte a bien été créé.\nVous pouvez maintenant vous connecter.');
					this.signupForm.reset();
					this.$pending.set(false);
					const toggleSignup = document.getElementById('toggleSignup');
					if (toggleSignup) {
						toggleSignup.click();
					}
				},
				error: (error) => {
					console.log(error)
					const message = error?.error?.message || "Erreur lors de la création de l'utilisateur.";
					this.toastService.open(ToastTypeEnum.ERROR, message);
					this.$pending.set(false);
				}
			});

			this.subscriptions.push(createUser$);
		} catch (err) {
			console.error(err);
		}
	}
}
