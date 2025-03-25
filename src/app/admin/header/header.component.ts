import { Component, HostListener, OnDestroy, signal, WritableSignal } from '@angular/core';
import { AsyncPipe, NgIf, NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '@App/ui/icon/icon.component';
import { chatIcon, homeIcon, settingsIcon, userIcon, visibleIcon } from '@App/utils/icons.utils';
import { ComponentBase } from '@App/base/component.base';
import { FirstletterPipe } from '@App/pipes/firstletter.pipe';
import { TooltipComponent } from '@App/ui/tooltip/tooltip.component';
import { DropdownComponent, DropdownItemComponent } from '@App/ui/dropdown/dropdown.component';
import { UserEntity } from '@App/entities/user.entity';
import { Subscription } from 'rxjs';
import { StatusUserEnum } from '@App/types/user';

@Component({
  selector: 'app-header',
	imports: [
		NgOptimizedImage,
		RouterLink,
		IconComponent,
		RouterLinkActive,
		NgIf,
		AsyncPipe,
		FirstletterPipe,
		TooltipComponent,
		DropdownComponent,
		DropdownItemComponent
	],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent extends ComponentBase implements OnDestroy {
	protected readonly homeIcon = homeIcon;
	protected readonly settingsIcon = settingsIcon;
	protected readonly chatIcon = chatIcon;
	protected readonly userIcon = userIcon;
	protected readonly visibleIcon = visibleIcon;

	private user!: UserEntity;

	private readonly userSubscription: Subscription;

	public $userSettings: WritableSignal<boolean> = signal(false);

	constructor() {
		super();

		this.userSubscription = this.user$.subscribe(user => {
			if (user) {
				this.user = user;
			}
		});
	}

	ngOnDestroy() {
		if (this.userSubscription) {
			this.userSubscription.unsubscribe();
		}
	}

	@HostListener('document:click', ['$event'])
	public onClick(event: MouseEvent) {
		const clickedInside = (event.target as HTMLElement).closest('[data-users-settings]');
		if (!clickedInside) {
			this.$userSettings.set(false);
		}
	}

	public openSettings() {
		this.$userSettings.set(!this.$userSettings());
	}

	public async handleLogout() {
		if (this.user) {
			await this.userService.update({
				uid: this.user.uid,
				status: StatusUserEnum.OFFLINE
			});

			await this.userService.logout();
		}
	}
}
