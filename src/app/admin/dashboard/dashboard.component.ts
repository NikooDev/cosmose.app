import { Component } from '@angular/core';
import { HeaderComponent } from '@Cosmose/admin/header/header.component';
import { SidebarComponent } from '@Cosmose/admin/sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
	imports: [
		HeaderComponent,
		SidebarComponent,
		RouterOutlet
	],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
