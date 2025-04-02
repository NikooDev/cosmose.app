import {
	ChangeDetectionStrategy,
	Component,
	effect,
	ElementRef,
	EventEmitter,
	inject,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	signal,
	SimpleChanges,
	ViewChild,
	WritableSignal
} from '@angular/core';
import { AsyncPipe, DatePipe, NgClass, NgIf, NgStyle } from '@angular/common';
import { ConfirmComponent } from '@App/ui/confirm/confirm.component';
import { DialogComponent } from '@App/ui/dialog/dialog.component';
import { FirstletterPipe } from '@App/pipes/firstletter.pipe';
import { IconComponent } from '@App/ui/icon/icon.component';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogService } from '@App/services/dialog.service';
import { UserEntity } from '@App/entities/user.entity';
import { companyIcon, ghostIcon, lockIcon, timeIcon, unlockIcon, userIcon } from '@App/utils/icons.utils';
import { RoleUserEnum, StatusUserEnum } from '@App/types/user';
import { inputStyle, isEmailRegex, isIp } from '@App/utils/constantes.utils';
import { ButtonComponent } from '@App/ui/button/button.component';
import { ComponentBase } from '@App/base/component.base';
import { ToastService } from '@App/services/toast.service';
import { ToastTypeEnum } from '@App/types/ui';
import { LoaderComponent } from '@App/ui/loader/loader.component';
import { BehaviorSubject, Subscription, switchMap, throwError } from 'rxjs';
import { SwitchComponent } from '@App/ui/switch/switch.component';
import { delay } from '@App/utils/functions.utils';
import { IpService } from '@App/services/ip.service';

@Component({
  selector: 'app-user-form',
	imports: [
		ConfirmComponent,
		DatePipe,
		DialogComponent,
		FirstletterPipe,
		IconComponent,
		NgIf,
		ReactiveFormsModule,
		NgClass,
		ButtonComponent,
		AsyncPipe,
		LoaderComponent,
		SwitchComponent,
		NgStyle
	],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserFormComponent extends ComponentBase implements OnInit, OnChanges, OnDestroy {
	public userForm!: FormGroup;

	public heightForm: BehaviorSubject<number> = new BehaviorSubject(0);

	public userSelectedIP!: string;

	public $isUpdated: WritableSignal<boolean> = signal(false);

	public $pending: WritableSignal<boolean> = signal(false);

	public $userAdminRole: WritableSignal<boolean> = signal(false);

	private dialogService = inject(DialogService);

	private builder = inject(FormBuilder);

	private toastService = inject(ToastService);

	private ipService = inject(IpService);

	private subscriptions: Subscription[] = [];

	@Input()
	public userSelected!: UserEntity | null;

	@Output()
	public deleteUser: EventEmitter<{ event: MouseEvent, userUID: string, role: RoleUserEnum[] }> = new EventEmitter();

	@ViewChild('lastname', { static: true })
	public lastname!: ElementRef;

	@ViewChild('userFormView')
	public userFormView!: ElementRef;

	protected readonly userIcon = userIcon;
	protected readonly lockIcon = lockIcon;
	protected readonly companyIcon = companyIcon;
	protected readonly unlockIcon = unlockIcon;
	protected readonly timeIcon = timeIcon;
	protected readonly StatusUserEnum = StatusUserEnum;
	protected readonly inputStyle = inputStyle;

	constructor() {
		super();

		effect(() => {
			const $isOpen: WritableSignal<boolean> = this.dialogService.isOpen('userDisplay');
			const isUpdated = this.$isUpdated();

			if (isUpdated) {
				this.initForm();
			}

			if ($isOpen()) {
				if (isUpdated) {
					this.heightForm.next(this.userFormView.nativeElement.clientHeight + 10)
				}
				setTimeout(() => this.lastname && this.lastname.nativeElement.focus(), 300);
			}
		});
	}

	ngOnInit() {
		this.initForm();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['userSelected'] && !changes['userSelected'].firstChange) {
			this.initForm();
		}
	}

	ngOnDestroy() {
		this.subscriptions.forEach(subscription => subscription.unsubscribe());
	}

	public initForm() {
		const form = {
			lastname: [this.userSelected?.lastname ?? '', [Validators.required]],
			firstname: [this.userSelected?.firstname ?? '', [Validators.required]],
			email: [this.userSelected?.email ?? '', [Validators.required, Validators.pattern(isEmailRegex)]],
		}

		const userForm = {
			...form,
			company: [this.userSelected?.company ?? '', [Validators.required]]
		}

		const adminForm = {
			...form,
			role: [this.userSelected?.role ?? [RoleUserEnum.ADMIN], [Validators.required]],
			publicAddress: ['', !this.userSelected ? [Validators.required, Validators.pattern(isIp)] : []],
			password: ['', !this.userSelected ? [Validators.required, Validators.minLength(6)] : []],
		}

		if (this.userSelected) {
			this.$userAdminRole.set(this.hasRole(this.superAdminRoles, this.userSelected.role));

			this.ipService.get(this.userSelected.uid).then(userIP => {
				if (userIP) {
					this.userSelectedIP = userIP.ip;
				}
			});
		}

		this.userForm = this.builder.group(this.userSelected && this.hasRole(this.userRoles, this.userSelected.role) ? userForm : adminForm);
	}

	public handleRole(value: boolean) {
		this.$userAdminRole.set(value);
		const role = this.userForm.get('role') as AbstractControl<RoleUserEnum[], RoleUserEnum[]>;

		if (value) {
			role.patchValue([RoleUserEnum.ADMIN, RoleUserEnum.SUPERADMIN]);
		} else {
			role.patchValue([RoleUserEnum.ADMIN]);
		}
	}

	public async updateUser(event: MouseEvent, user: UserEntity) {
		event.preventDefault();

		const isUser = this.hasRole(this.userRoles, user.role);

		if (this.$isUpdated()) {
			const valid = this.validationErrors(isUser);
			const { email, password, company, firstname, lastname, role, publicAddress } = this.userForm.getRawValue() as Partial<UserEntity> & { password: string, publicAddress: string };

			if (email && email !== user.email && !isEmailRegex.test(email)) {
				this.toastService.open(ToastTypeEnum.ERROR, 'L\'adresse e-mail est invalide.', undefined, { unique: true });
				return;
			}

			if (password && password.length < 6) {
				this.toastService.open(ToastTypeEnum.ERROR, 'Le mot de passe doit être au moins de 6 caractères.', undefined, { unique: true });
				return;
			}

			const updatedUser = Object.fromEntries(
				Object.entries({
					...user,
					...(lastname ? { lastname } : {}),
					...(firstname ? { firstname } : {}),
					...(email ? { email } : {}),
					...(role ? { role } : {}),
					...(isUser ? { company } : {}),
					...(publicAddress ? { publicAddress } : {})
				}).filter(([_, value]) => value !== undefined)
			);


			if (valid && user) {
				this.$pending.set(true);

				try {
					if (email && email !== user.email || password || publicAddress) {
						const updateUser$ = this.userService.updateUser(user.uid, user.role, email, password, publicAddress, user.revoked).pipe(
							switchMap((result) => {
								if (result.success) {
									return this.userService.update(updatedUser);
								} else {
									return throwError(() => new Error('Failed to update user in Firebase Auth'));
								}
							})
						).subscribe({
							next: () => {
								if (firstname && lastname) {
									this.toastService.open(ToastTypeEnum.SUCCESS, `L'${isUser ? 'utilisateur' : 'administrateur'} "${firstname.cap()} ${lastname.cap()}" a bien été modifié.`);
								}
								this.$pending.set(false);
								this.dialogService.close('userDisplay');
								this.$isUpdated.set(false);
								this.heightForm.next(0);
							},
							error: (error) => {
								console.error(error);
								this.toastService.open(ToastTypeEnum.ERROR, `Erreur lors de la modification de l'${isUser ? 'utilisateur' : 'administrateur'}.`);
								this.$pending.set(false);
							}
						});

						this.subscriptions.push(updateUser$);
					} else {
						await this.userService.update(updatedUser);

						if (firstname && lastname) {
							this.toastService.open(ToastTypeEnum.SUCCESS, `L'${isUser ? 'utilisateur' : 'administrateur'} "${firstname.cap()} ${lastname.cap()}" a bien été modifié.`);
						}

						this.$pending.set(false);
						this.dialogService.close('userDisplay');
						this.$isUpdated.set(false);
						this.heightForm.next(0);
					}
				} catch (error) {
					console.error(error);
					this.$pending.set(false);
					this.toastService.open(ToastTypeEnum.ERROR, `Erreur lors de la modification de l'${isUser ? 'utilisateur' : 'administrateur'}.`);
				}
			}
		} else {
			this.$isUpdated.set(true);
		}
	}

	public async createAdmin(event: MouseEvent) {
		event.preventDefault();

		const valid = this.validationErrors(false);

		if (valid) {
			const { email, password, publicAddress, ...userForm } = this.userForm.getRawValue() as Partial<UserEntity> & { password: string, publicAddress: string };
			if (!email || !password) {
				return;
			}

			this.$pending.set(true);

			try {
				const createAdmin$ = this.userService.createAdmin(email, password, publicAddress).pipe(
					switchMap((result) => {
						if (result.success) {
							return this.userService.create({
								uid: result.uid,
								email: email,
								firstname: userForm.firstname,
								lastname: userForm.lastname,
								role: [RoleUserEnum.ADMIN],
								revoked: false,
								status: StatusUserEnum.OFFLINE
							});
						} else {
							return throwError(() => new Error('Failed to create admin in Firebase Auth'));
						}
					})
				).subscribe({
					next: () => {
						if (userForm.firstname && userForm.lastname) {
							this.toastService.open(ToastTypeEnum.SUCCESS, `L'administrateur "${userForm.firstname.cap()} ${userForm.lastname.cap()}" a bien été créé.`);
						}
						this.userForm.reset();
						this.$pending.set(false);
						this.dialogService.close('userDisplay');
					},
					error: (error) => {
						console.error(error);
						this.toastService.open(ToastTypeEnum.ERROR, 'Erreur lors de la création de l\'administrateur.');
						this.$pending.set(false);
					}
				});

				this.subscriptions.push(createAdmin$);
			} catch (error) {
				console.error(error);
			}
		}
	}

	public cancel(event: MouseEvent, dialogID: string): void {
		event.preventDefault();

		this.initForm();

		if (this.$isUpdated()) {
			this.$isUpdated.set(false);
		}

		this.dialogService.close(dialogID);
		this.heightForm.next(0);
	}

	public confirmDeleteUser() {
		this.dialogService.open('deleteUser');
	}

	public formClasses() {
		return {
			'opacity-0 invisible': !this.$isUpdated() && this.userSelected,
			'opacity-100 visible': this.$isUpdated()
		}
	}

	private validationErrors(updateUser: boolean): boolean {
		const errorsDefault = [
			{field: 'lastname', message: 'Le nom est requis.'},
			{field: 'firstname', message: 'Le prénom est requise.'},
			{field: 'email', message: 'L\'adresse e-mail est requise.'}
		];

		const errorsUser = [
			...errorsDefault,
			{field: 'company', message: 'L\'entreprise est requise.'}
		]

		const errorsAdmin = [
			...errorsDefault,
			{field: 'publicAddress', message: 'L\'adresse IP est requise.'},
			{field: 'password', message: 'Le mot de passe est requis et doit être au moins de 6 caractères.'}
		]

		const errors = updateUser ? errorsUser : errorsAdmin;

		for (const error of errors) {
			const control = this.userForm.get(error.field);

			if (control?.invalid) {
				this.toastService.open(ToastTypeEnum.ERROR, error.message, undefined, { unique: true });
				return false;
			}
		}

		this.userForm.markAllAsTouched();
		return true;
	}

	public async revokeUser(user: UserEntity | null) {
		const { promise } = delay(2000);

		if (!user) {
			return;
		}

		this.$pending.set(true);
		await promise;

		const revokeUser$ = this.userService.revokeUser(user.uid).pipe(
			switchMap((result) => {
				if (result.success) {
					return this.userService.update({ uid: user.uid, revoked: true });
				} else {
					return throwError(() => new Error('Failed to update user in Firebase Auth'));
				}
			})
		).subscribe({
			next: () => {
				if (user.firstname && user.lastname) {
					this.toastService.open(ToastTypeEnum.SUCCESS, `L'administrateur "${user.firstname.cap()} ${user.lastname.cap()}" est maintenant bloqué.`);
				}
				this.dialogService.close('userDisplay');
				this.$pending.set(false);
			},
			error: (error) => {
				console.error(error);
				this.toastService.open(ToastTypeEnum.ERROR, 'Erreur lors de la révocation de l\'administrateur.');
				this.$pending.set(false);
			}
		});

		this.subscriptions.push(revokeUser$);
	}

	public async unRevokeUser(user: UserEntity | null) {
		const { promise } = delay(2000);

		if (!user) {
			return;
		}

		this.$pending.set(true);
		await promise;

		const unRevokeUser$ = this.userService.unRevokeUser(user.uid).pipe(
			switchMap((result) => {
				if (result.success) {
					return this.userService.update({ uid: user.uid, revoked: false });
				} else {
					return throwError(() => new Error('Failed to update user in Firebase Auth'));
				}
			})
		).subscribe({
			next: () => {
				if (user.firstname && user.lastname) {
					this.toastService.open(ToastTypeEnum.SUCCESS, `"${user.firstname.cap()} ${user.lastname.cap()}" peut désormais se connecter.`);
				}
				this.dialogService.close('userDisplay');
				this.$pending.set(false);
			},
			error: (error) => {
				console.error(error);
				this.toastService.open(ToastTypeEnum.ERROR, 'Erreur lors du rétablissement de l\'accès de l\'administrateur.');
				this.$pending.set(false);
			}
		});

		this.subscriptions.push(unRevokeUser$);
	}

	protected readonly ghostIcon = ghostIcon;
}
