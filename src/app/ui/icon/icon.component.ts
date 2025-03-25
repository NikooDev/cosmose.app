import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';

@Component({
  selector: 'app-icon',
  imports: [],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconComponent {
	@Input({ required: true })
	public path!: string;

	@Input()
	public height: number = 24;

	@Input()
	public width: number = 24;

	@Input()
	public color: string = '#000';

	@Input()
	public viewBox: string = '0 0 24 24';

	@Input()
	public styleContainer: string = '';
}
