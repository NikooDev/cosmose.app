import { Routes } from '@angular/router';
import { AuthComponent } from '@Cosmose/auth/auth.component';
import { JoinComponent } from '@Cosmose/room/join/join.component';
import { LobbyComponent } from '@Cosmose/room/lobby/lobby.component';
import { DashboardComponent } from '@Cosmose/admin/dashboard/dashboard.component';
import { UsersComponent } from '@Cosmose/admin/users/users.component';
import { ActivitiesComponent } from '@Cosmose/admin/activities/activities.component';
import { BlogComponent } from '@Cosmose/admin/blog/blog.component';
import { BookingComponent } from '@Cosmose/admin/booking/booking.component';
import { AgendaComponent } from '@Cosmose/admin/agenda/agenda.component';
import { ReviewsComponent } from '@Cosmose/admin/reviews/reviews.component';
import { StatsComponent } from '@Cosmose/admin/stats/stats.component';
import { SettingsComponent } from '@Cosmose/admin/settings/settings.component';
import { ChatComponent } from '@Cosmose/admin/chat/chat.component';
import { roomGuard } from '@/app/guards/room.guard';

export const routes: Routes = [
	{
		path: '',
		component: AuthComponent,
		canActivate: [roomGuard]
	},
	{
		path: 'room',
		children: [
			{
				path: '',
				component: JoinComponent
			},
			{
				path: 'lobby',
				component: LobbyComponent
			}
		]
	},
	{
		path: 'game',
		children: [

		]
	},
	{
		path: 'admin',
		children: [
			{
				path: '',
				redirectTo: 'dashboard',
				pathMatch: 'full'
			},
			{
				path: 'dashboard',
				component: DashboardComponent
			},
			{
				path: 'booking',
				component: BookingComponent
			},
			{
				path: 'agenda',
				component: AgendaComponent
			},
			{
				path: 'users',
				component: UsersComponent
			},
			{
				path: 'activities',
				component: ActivitiesComponent
			},
			{
				path: 'reviews',
				component: ReviewsComponent
			},
			{
				path: 'blog',
				component: BlogComponent
			},
			{
				path: 'stats',
				component: StatsComponent
			},
			{
				path: 'settings',
				component: SettingsComponent
			},
			{
				path: 'chat',
				component: ChatComponent
			}
		]
	}
];
