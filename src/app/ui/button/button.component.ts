import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	Output
} from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-button',
	imports: [
		NgClass
	],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'[class.w-full]': 'full'
	}
})
export class ButtonComponent {
	@Input({ required: true })
	public type!: HTMLButtonElement['type'];

	@Input({ required: true })
	public appearance!: 'flat' | 'basic';

	@Input()
	public className!: string;

	@Input()
	public full!: boolean;

	@Input()
	public disabled!: boolean;

	@Input()
	public color: 'primary' | 'delete' | 'default' | 'none' = 'default';

	@Output()
	public onClick: EventEmitter<{ event: MouseEvent, params?: any }> = new EventEmitter();

	public handleClick(event: MouseEvent) {
		if (!this.disabled) {
			this.onClick.emit({ event });
		} else {
			event.preventDefault();
			event.stopPropagation();
		}
	}

	private fullClass() {
		return {
			'full': this.full
		}
	}

	private appearenceClass() {
		return {
			'flat': this.appearance === 'flat',
			'basic': this.appearance === 'basic',
		}
	}

	private colorClass() {
		if (this.appearance === 'flat') {
			return {
				'flat-default': this.color === 'default',
				'flat-primary': this.color === 'primary',
				'flat-delete': this.color === 'delete',
				'flat-none': this.color === 'none'
			}
		} else {
			return {
				'basic-default': this.color === 'default',
				'basic-primary': this.color === 'primary',
				'basic-delete': this.color === 'delete',
				'basic-none': this.color === 'none'
			}
		}
	}

	public ngClass() {
		return Object.assign({}, this.appearenceClass(), this.colorClass(), this.fullClass());
	}
}
