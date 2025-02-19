import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '@Cosmose/ui/icon/icon.component';
import {
	activitiesIcon,
	agendaIcon,
	blogIcon,
	bookingIcon,
	dashboardIcon,
	reviewsIcon, statsIcon,
	usersIcon
} from '@Cosmose/utils/icons';

@Component({
  selector: 'app-sidebar',
	imports: [
		RouterLink,
		IconComponent,
		RouterLinkActive
	],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
	protected readonly dashboardIcon = dashboardIcon;
	protected readonly bookingIcon = bookingIcon;
	protected readonly agendaIcon = agendaIcon;
	protected readonly usersIcon = usersIcon;
	protected readonly activitiesIcon = activitiesIcon;
	protected readonly reviewsIcon = reviewsIcon;
	protected readonly blogIcon = blogIcon;
	protected readonly statsIcon = statsIcon;

	protected readonly linkClass = 'flex items-center hover:shadow-md space-x-4 text-slate-800 hover:bg-theme-50 hover:text-theme-500 py-2 px-3 rounded-lg transitions-all duration-300'
}
