import { Component } from '@angular/core';
import { ComponentBase } from '@App/base/component.base';
import { AsyncPipe, NgIf } from '@angular/common';
import { element } from '@App/utils/animations.utils';

@Component({
  selector: 'app-reviews',
	imports: [
		AsyncPipe,
		NgIf
	],
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.scss',
	animations: [element]
})
export class ReviewsComponent extends ComponentBase {
	constructor() {
		super();
	}
}
