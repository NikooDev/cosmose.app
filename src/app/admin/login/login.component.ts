import { Component, inject, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { CardComponent } from '@App/ui/card/card.component';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { inputStyleNexa, isEmailRegex } from '@App/utils/constantes.utils';
import { NgIf, NgOptimizedImage } from '@angular/common';
import { ComponentBase } from '@App/base/component.base';
import { ToastService } from '@App/services/toast.service';
import { ToastTypeEnum } from '@App/types/ui';
import { delay } from '@App/utils/functions.utils';
import { LoaderComponent } from '@App/ui/loader/loader.component';
import { FirebaseError } from '@firebase/util'
import { catchError } from '@App/handlers/message';
import { Router } from '@angular/router';
import { Subscription, switchMap } from 'rxjs';
import { element } from '@App/utils/animations.utils';
import { ButtonComponent } from '@App/ui/button/button.component';
import { StatusUserEnum } from '@App/types/user';

@Component({
  selector: 'app-admin-login',
	imports: [
		CardComponent,
		ReactiveFormsModule,
		NgOptimizedImage,
		NgIf,
		LoaderComponent,
		ButtonComponent
	],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
	animations: [element]
})
export class LoginAdminComponent extends ComponentBase implements OnInit, OnDestroy {
	public loginForm!: FormGroup;

	public pending: WritableSignal<boolean> = signal(false);

	private formBuilder = inject(FormBuilder);

	private toastService = inject(ToastService);

	private router = inject(Router);

	private subscriptions: Subscription[] = [];

	protected readonly inputStyle= inputStyleNexa;

	constructor() {
		super();
	}

	ngOnInit() {
		this.initForm();
	}

	ngOnDestroy() {
		this.subscriptions.forEach(subscription => subscription.unsubscribe());
	}

	public initForm() {
		this.loginForm = this.formBuilder.group({
			email: ['', [Validators.required]],
			password: ['', [Validators.required]]
		});
	}

	public async submit() {
		this.cdr.markForCheck();

		const email = this.loginForm.get('email') as AbstractControl<string, string>;
		const password = this.loginForm.get('password') as AbstractControl<string, string>;

		if (!email.value || !password.value) {
			this.toastService.open(ToastTypeEnum.ERROR, 'Tous les champs sont requis.', undefined, { unique: true });
			return;
		}

		if (email.value && !isEmailRegex.test(email.value)) {
			this.toastService.open(ToastTypeEnum.ERROR, 'Votre adresse e-mail est incorrecte.', undefined, { unique: true });
			return;
		}

		this.pending.set(true);
		email.disable();
		password.disable();

		const { promise } = delay(1000);

		await promise;

		try {
			await this.userService.login(email.value, password.value);

			const user$ = this.user$.pipe(
				switchMap(async (user) => {
					if (user) {
						await this.router.navigate(['/admin/dashboard']);

						if (user.status !== StatusUserEnum.ONLINE) {
							await this.userService.update({ uid: user.uid, status: StatusUserEnum.ONLINE });
						}
					}
				})
			).subscribe();

			this.subscriptions.push(user$);
		} catch (error) {
			console.error(error);

			if (error instanceof FirebaseError) {
				const messageError = catchError(error.code);

				this.toastService.open(ToastTypeEnum.ERROR, messageError, undefined, { unique: true });
			}

			this.pending.set(false);
			email.enable();
			password.enable();
			this.cdr.detectChanges();
		}
	}
}
