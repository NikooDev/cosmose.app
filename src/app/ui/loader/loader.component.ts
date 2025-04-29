import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgClass, NgIf, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-loader',
	imports: [
		NgIf,
		NgTemplateOutlet,
		NgClass
	],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderComponent {
	@Input({ required: true })
	public pending!: boolean;

	@Input({ required: true })
	public isAdmin!: boolean;

	@Input({ required: true })
	public isGuest!: boolean;

	@Input({ required: true })
	public isUser!: boolean;

	@Input({ required: true })
	public slideInOut: boolean = false;

	@Input()
	public color: string = '#000';

	@Input()
	public size: number = 50;

	@Input()
	public strokeWidth: number = 3;
}
