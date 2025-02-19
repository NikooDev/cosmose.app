import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '@Cosmose/ui/icon/icon.component';
import { chatIcon, dashboardIcon, homeIcon, settingsIcon, userIcon } from '@Cosmose/utils/icons';

@Component({
  selector: 'app-header',
	imports: [
		NgOptimizedImage,
		RouterLink,
		IconComponent,
		RouterLinkActive
	],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
	protected readonly homeIcon = homeIcon;
	protected readonly settingsIcon = settingsIcon;
	protected readonly chatIcon = chatIcon;
	protected readonly userIcon = userIcon;
}
