import { Routes } from '@angular/router';
import * as AdminComponent from '@App/admin';
import { AuthComponent } from '@App/auth/auth.component';
import { DashboardComponent } from '@App/admin';
import { NotFoundComponent } from '@App/errors/not-found/not-found.component';
import { LoginAdminComponent } from '@App/admin/login/login.component';
import { roomResolver } from '@App/resolvers/room.resolver';
import { adminGuard } from '@App/guards/admin.guard';
import { ipGuard } from '@App/guards/ip.guard';
import { guestGuard } from '@App/guards/guest.guard';
import { adminLoggedGuard } from '@App/guards/admin-logged.guard';

export const routes: Routes = [
	{
		path: '',
		component: AuthComponent,
		canActivate: [guestGuard],
		resolve: {
			room: roomResolver
		}
	},
	{
		path: 'admin',
		children: [
			{
				path: '',
				redirectTo: 'login',
				pathMatch: 'full'
			},
			{
				path: 'login',
				component: LoginAdminComponent,
				canActivate: [ipGuard, adminLoggedGuard]
			}
		]
	},
	{
		path: 'admin',
		canActivateChild: [adminGuard],
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
				component: AdminComponent.BookingComponent
			},
			{
				path: 'agenda',
				component: AdminComponent.AgendaComponent
			},
			{
				path: 'users',
				component: AdminComponent.UsersComponent
			},
			{
				path: 'activities',
				component: AdminComponent.ActivitiesComponent
			},
			{
				path: 'reviews',
				component: AdminComponent.ReviewsComponent
			},
			{
				path: 'blog',
				component: AdminComponent.BlogComponent
			},
			{
				path: 'stats',
				component: AdminComponent.StatsComponent
			},
			{
				path: 'chat',
				component: AdminComponent.ChatComponent
			}
		]
	},
	{
		path: '**',
		component: NotFoundComponent
	}
];
