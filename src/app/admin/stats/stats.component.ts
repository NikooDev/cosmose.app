import { Component } from '@angular/core';
import { ComponentBase } from '@App/base/component.base';
import { AsyncPipe, NgIf } from '@angular/common';
import { element } from '@App/utils/animations.utils';

@Component({
  selector: 'app-stats',
	imports: [
		AsyncPipe,
		NgIf
	],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
	animations: [element]
})
export class StatsComponent extends ComponentBase {
	constructor() {
		super();
	}
}
