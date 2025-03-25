import { Component } from '@angular/core';
import { ComponentBase } from '@App/base/component.base';
import { AsyncPipe, NgIf } from '@angular/common';
import { element } from '@App/utils/animations.utils';

@Component({
  selector: 'app-chat',
	imports: [
		AsyncPipe,
		NgIf
	],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
	animations: [element]
})
export class ChatComponent extends ComponentBase {
	constructor() {
		super();
	}
}
