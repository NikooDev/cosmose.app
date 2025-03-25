import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonComponent } from '@App/ui/button/button.component';
import { NgClass, NgIf } from '@angular/common';


@Component({
  selector: 'app-dropdown',
	imports: [
		NgClass,
		NgIf
	],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownComponent {
	@Input({ required: true })
	public isOpen!: boolean;

	@Input({ required: true })
	public hasHeader!: boolean;

	@Input({ required: true })
	public offset!: number;
}

@Component({
	selector: 'app-dropdown-item',
	imports: [
		ButtonComponent
	],
	templateUrl: './item.component.html',
	styleUrl: './item.component.scss',
	host: {
		'[class.divider]': 'divider'
	},
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownItemComponent {
	@Input()
	public color: 'primary' | 'delete' | 'default' | 'none' = 'none';

	@Input()
	public divider: boolean = true;

	@Output()
	public itemClick: EventEmitter<MouseEvent> = new EventEmitter();
}
