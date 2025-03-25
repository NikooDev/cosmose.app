import { Component } from '@angular/core';
import { redirectToHome } from '@App/utils/functions.utils';

@Component({
  selector: 'app-not-found',
	imports: [],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {
	public backToHome(event: MouseEvent): void {
		event.preventDefault();

		redirectToHome();
	}
}
