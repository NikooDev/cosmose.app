import {ChangeDetectionStrategy, Component, inject, Input, OnInit, signal, WritableSignal} from '@angular/core';
import { CardComponent } from '@App/ui/card/card.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { inputStyleNexa, isEmailRegex } from '@App/utils/constantes.utils';
import {NgIf, NgOptimizedImage} from '@angular/common';
import { ButtonComponent } from '@App/ui/button/button.component';
import {UserEntity} from '@App/entities/user.entity';
import {Router} from '@angular/router';
import {delay} from '@App/utils/functions.utils';
import {LoaderComponent} from '@App/ui/loader/loader.component';
import {ToastTypeEnum} from '@App/types/ui';
import {ToastService} from '@App/services/toast.service';
import {FirebaseError} from '@firebase/util';
import {ComponentBase} from '@App/base/component.base';

@Component({
  selector: 'app-login',
	imports: [
		CardComponent,
		ReactiveFormsModule,
		NgOptimizedImage,
		ButtonComponent,
		NgIf,
		LoaderComponent
	],
  templateUrl: './login.component.html',
  styleUrl: './../auth.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent extends ComponentBase implements OnInit {
	@Input()
	public toggleView!: (event: MouseEvent) => void;

	@Input()
	public company!: string;

	@Input()
	public roomID!: string;

	public $pending: WritableSignal<boolean> = signal(false);

	public loginForm!: FormGroup;

	private formBuilder = inject(FormBuilder);

	private router = inject(Router);

	private toastService = inject(ToastService);

	protected readonly inputStyle= inputStyleNexa;

	constructor() {
		super();
	}

	ngOnInit() {
		this.initForm();
	}

	public initForm() {
		this.loginForm = this.formBuilder.group({
			email: ['', [Validators.pattern(isEmailRegex), Validators.required]],
			password: ['', [Validators.required]]
		});
	}

	public async submit() {
		this.$pending.set(true);

		const { promise } = delay(2000);
		await promise;

		const user = this.loginForm.getRawValue() as UserEntity & { password: string };

		try {
			const userCredential = await this.userService.login(user.email, user.password);

			if (userCredential) {
				await this.userService.update({ uid: userCredential.user.uid, roomID: this.roomID });
				window.location.reload();
				this.$pending.set(false);
			}
		} catch (error) {
			let message: string = '';

			if (error instanceof FirebaseError) {
				switch (error.code) {
					case 'auth/invalid-email':
						message = "L'adresse email est invalide.";
						break;
					case 'auth/user-disabled':
						message = "Ce compte a été désactivé. Veuillez contacter le support.";
						break;
					case 'auth/user-not-found':
						message = "Aucun compte trouvé avec cet email.";
						break;
					case 'auth/wrong-password':
						message = "Mot de passe incorrect.";
						break;
					case 'auth/too-many-requests':
						message = "Trop de tentatives. Veuillez réessayer plus tard.";
						break;
					case 'auth/network-request-failed':
						message = "Problème de connexion internet.";
						break;
					default:
						message = "Une erreur est survenue lors de la connexion.";
						break;
				}
			}

			this.toastService.open(ToastTypeEnum.ERROR, message);
			this.$pending.set(false);
		}
	}
}
