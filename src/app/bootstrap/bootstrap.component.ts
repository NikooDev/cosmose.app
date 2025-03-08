import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	inject,
	OnDestroy,
	OnInit, signal,
	WritableSignal
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { HeaderComponent } from '@Cosmose/admin/header/header.component';
import { SidebarComponent } from '@Cosmose/admin/sidebar/sidebar.component';
import { NgClass, NgIf } from '@angular/common';
import { LoaderComponent } from '@/app/ui/loader/loader.component';
import { slideInDown } from '@/app/utils/animations';

@Component({
  selector: 'app-bootstrap',
	imports: [
		RouterOutlet,
		HeaderComponent,
		SidebarComponent,
		NgIf,
		LoaderComponent,
		NgClass
	],
  templateUrl: './bootstrap.component.html',
  styleUrl: './bootstrap.component.scss',
	animations: [slideInDown],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class BootstrapComponent implements OnInit, OnDestroy {
	private router = inject(Router);
	private cdr = inject(ChangeDetectorRef);
	private route = inject(ActivatedRoute);
	private subscriptions: Subscription[] = [];

	public isAdminRoute = false;

	public pending: WritableSignal<boolean> = signal(false);

	constructor() {
		const router$ = this.router.events.subscribe((event) => {
			this.isAdminRoute = this.router.url.startsWith('/admin');

			if (event instanceof NavigationStart) {
				setTimeout(() => {
					this.pending.set(true);
				}, 50);
			}

			if (event instanceof NavigationEnd) {
				setTimeout(() => {
					this.pending.set(false);
				}, 1000);
			}
		});

		this.subscriptions.push(router$);
	}

	ngOnInit() {
		const route$ = this.route.data.subscribe((data: { room?: boolean }) => {
			//this.pending = !data.room;
		});

		this.subscriptions.push(route$);
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}
}
