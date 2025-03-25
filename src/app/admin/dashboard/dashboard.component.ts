import { Component } from '@angular/core';
import { ComponentBase } from '@App/base/component.base';
import { AsyncPipe, NgIf } from '@angular/common';
import { element } from '@App/utils/animations.utils';

@Component({
  selector: 'app-dashboard',
	imports: [
		NgIf,
		AsyncPipe

	],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
	animations: [element]
})
export class DashboardComponent extends ComponentBase {
	constructor() {
		super();
	}
}
