import { Component, inject, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { ComponentBase } from '@App/base/component.base';
import { AsyncPipe, NgIf } from '@angular/common';
import { UserEntity } from '@App/entities/user.entity';
import { RoleUserEnum, UsersCompanyInterface } from '@App/types/user';
import { element } from '@App/utils/animations.utils';
import { BehaviorSubject, catchError, finalize, forkJoin, of, Subscription, switchMap, tap, throwError } from 'rxjs';
import { DialogService } from '@App/services/dialog.service';
import { ReactiveFormsModule } from '@angular/forms';
import { LoaderComponent } from '@App/ui/loader/loader.component';
import { UserFormComponent } from '@App/admin/users/user-form/user-form.component';
import { AdminCardComponent } from '@App/admin/users/admin-card/admin-card.component';
import { UserTableComponent } from '@App/admin/users/user-table/user-table.component';
import { ButtonComponent } from '@App/ui/button/button.component';
import { ToastTypeEnum } from '@App/types/ui';
import { ToastService } from '@App/services/toast.service';

@Component({
  selector: 'app-users',
	imports: [
		AsyncPipe,
		NgIf,
		ReactiveFormsModule,
		LoaderComponent,
		UserFormComponent,
		AdminCardComponent,
		UserTableComponent,
		ButtonComponent
	],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
	animations: [element]
})
export class UsersComponent extends ComponentBase implements OnInit, OnDestroy {
	public admins$: BehaviorSubject<UserEntity[] | null> = new BehaviorSubject<UserEntity[] | null>(null);

	public userSelected$: BehaviorSubject<UserEntity | null> = new BehaviorSubject<UserEntity | null>(null);

	public usersCompanies$: BehaviorSubject<UsersCompanyInterface[]> = new BehaviorSubject<UsersCompanyInterface[]>([]);

	public $pending: WritableSignal<boolean> = signal(false);

	private dialogService = inject(DialogService);

	private toastService = inject(ToastService);

	private subscriptions: Subscription[] = [];

	constructor() {
		super();
	}

	ngOnInit() {
		const usersList$ = this.userService._list().subscribe((usersList) => {
			const usersEntity = usersList.map(user => new UserEntity(user));

			const admins = usersEntity.filter(user => user.role.some(role => this.adminRoles.includes(role)));
			const users = usersEntity.filter(user => user.role.some(role => this.userRoles.includes(role)));

			const grouped = users.reduce((acc, user) => {
				(acc[user.company] = acc[user.company] || []).push(user);
				return acc;
			}, {} as Record<string, UserEntity[]>);

			const groupedUsersCompany = Object.keys(grouped).map(company => ({
				company: company as string,
				users: grouped[company] as UserEntity[]
			}));

			this.usersCompanies$.next(groupedUsersCompany);
			this.admins$.next(admins);
		});

		this.subscriptions.push(usersList$);
	}

	ngOnDestroy() {
		this.subscriptions.forEach(subscription => subscription.unsubscribe());
	}

	public userDisplay(userUID: string | undefined) {
		if (userUID) {
			const userSelected$ = this.userService._get(userUID).subscribe((user) => {
				const userEntity = new UserEntity(user);

				this.userSelected$.next(userEntity);
			});

			this.subscriptions.push(userSelected$);

			this.dialogService.open('userDisplay');
		}
	}

	public createAdmin() {
		this.userSelected$.next(null);
		this.dialogService.open('userDisplay');
	}

	public async deleteUser(event: MouseEvent, userUID: string, role: RoleUserEnum[]) {
		event.preventDefault();
		this.$pending.set(true);

		this.dialogService.close('deleteUser');
		this.dialogService.close('userDisplay');

		const deleteUser$ = this.userService.deleteUser(userUID).pipe(
			switchMap((result) => {
				if (result.success) {
					return this.userService.delete(userUID);
				} else {
					return throwError(() => new Error('Failed to delete user in Firebase Auth'));
				}
			})
		).subscribe({
			next: () => {
				const isAdmin = role.some(adminRole => this.adminRoles.includes(adminRole));

				this.toastService.open(ToastTypeEnum.SUCCESS, `L'${isAdmin ? 'administrateur' : 'utilisateur'} a bien été supprimé.`);
				this.$pending.set(false);
			},
			error: (error) => {
				console.error(error);
				this.toastService.open(ToastTypeEnum.ERROR, 'Erreur lors de la suppression.');
				this.$pending.set(false);
			}
		});

		this.subscriptions.push(deleteUser$);
	}

	public async deleteUsers(event: MouseEvent, users: UserEntity[]) {
		event.preventDefault();
		this.$pending.set(true);

		this.dialogService.close('deleteUsers');

		const deleteFirestoreDocs$ = forkJoin(
			users.map(user => this.userService.delete(user.uid))
		);

		const deleteUser$ = deleteFirestoreDocs$.pipe(
			switchMap(() => this.userService.deleteUsers(users)),
			tap((result) => {
				if (result.success) {
					this.toastService.open(ToastTypeEnum.SUCCESS, 'Les utilisateurs ont bien été supprimés.');
				} else {
					throw new Error('Échec de la suppression des comptes Firebase Auth.');
				}
			}),
			catchError((error) => {
				console.error(error);
				this.toastService.open(ToastTypeEnum.ERROR, 'Erreur lors de la suppression.');
				return of(null);
			}),
			finalize(() => {
				this.$pending.set(false);
			})
		).subscribe();

		this.subscriptions.push(deleteUser$);

		this.$pending.set(false);
	}
}
