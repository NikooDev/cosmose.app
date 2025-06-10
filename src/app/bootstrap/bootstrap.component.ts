import {Component, inject, OnDestroy} from '@angular/core';
import {ComponentBase} from '@App/base/component.base';
import {NgClass, NgIf} from '@angular/common';
import {NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet} from '@angular/router';
import {HeaderComponent} from '@App/admin/header/header.component';
import {SidebarComponent} from '@App/admin/sidebar/sidebar.component';
import {RoleUserEnum} from '@App/types/user';
import {filter, Subscription, switchMap} from 'rxjs';
import {LoaderComponent} from '@App/ui/loader/loader.component';
import {delay} from '@App/utils/functions.utils';
import {ToastHostComponent} from '@App/ui/toast/toast-host/toast-host.component';
import {UserEntity} from '@App/entities/user.entity';

@Component({
	selector: 'app-bootstrap',
	imports: [
		NgIf,
		RouterOutlet,
		HeaderComponent,
		SidebarComponent,
		LoaderComponent,
		ToastHostComponent,
		NgClass
	],
	templateUrl: './bootstrap.component.html',
	styleUrl: './bootstrap.component.scss',
})
export class BootstrapComponent extends ComponentBase implements OnDestroy {
	private router = inject(Router);

	private subscriptions: Subscription[] = [];

	private timeoutId: number | null = null;

	public pending: boolean = false;

	public user: UserEntity | null = null;

	constructor() {
		super();

		this.user$.subscribe(u => {
			this.user = u;
			this.cdr.detectChanges();
		});

		this.initNavLoader();
	}

	ngOnDestroy() {
		this.subscriptions.forEach(subscription => subscription.unsubscribe());

		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
		}
	}

	public isAdmin(role: RoleUserEnum) {
		if (role) {
			return role === RoleUserEnum.ADMIN;
		} else {
			return false;
		}
	}

	private initNavLoader() {
		const router$ = this.router.events.pipe(
			filter(event =>
				event instanceof NavigationStart ||
				event instanceof NavigationEnd ||
				event instanceof NavigationError ||
				event instanceof NavigationCancel
			),
			switchMap(async event => {
				if (event instanceof NavigationStart) {
					if (this.timeoutId) {
						clearTimeout(this.timeoutId);
						this.timeoutId = null;
					}

					this.pending = true;
					this.cdr.markForCheck();
				} else {
					const {promise, id} = delay(1000);
					this.timeoutId = id;
					await promise;

					this.pending = false;
					this.cdr.markForCheck();
				}
			})
		).subscribe();

		this.subscriptions.push(router$);
	}
}
