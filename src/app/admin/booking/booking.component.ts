import { Component } from '@angular/core';
import { ComponentBase } from '@App/base/component.base';
import { AsyncPipe, NgIf } from '@angular/common';
import { element } from '@App/utils/animations.utils';

@Component({
  selector: 'app-booking',
	imports: [
		AsyncPipe,
		NgIf
	],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss',
	animations: [element]
})
export class BookingComponent extends ComponentBase {
	constructor() {
		super();
	}
}
