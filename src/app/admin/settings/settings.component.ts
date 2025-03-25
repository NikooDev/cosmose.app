import { Component } from '@angular/core';
import { ComponentBase } from '@App/base/component.base';
import { AsyncPipe, NgIf } from '@angular/common';
import { element } from '@App/utils/animations.utils';

@Component({
  selector: 'app-settings',
	imports: [
		AsyncPipe,
		NgIf
	],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
	animations: [element]
})
export class SettingsComponent extends ComponentBase {
	constructor() {
		super();
	}
}
