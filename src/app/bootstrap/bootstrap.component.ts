import { Component, inject, OnDestroy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { HeaderComponent } from '@Cosmose/admin/header/header.component';
import { SidebarComponent } from '@Cosmose/admin/sidebar/sidebar.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-bootstrap',
	imports: [
		RouterOutlet,
		HeaderComponent,
		SidebarComponent,
		NgIf
	],
  templateUrl: './bootstrap.component.html',
  styleUrl: './bootstrap.component.scss'
})
export class BootstrapComponent implements OnDestroy {
	private router = inject(Router);
	private subscriptions: Subscription[] = [];

	public isAdminRoute = false;

	constructor() {
		const router$ = this.router.events.subscribe(() => {
			this.isAdminRoute = this.router.url.startsWith('/admin');
		});

		this.subscriptions.push(router$);
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}
}
