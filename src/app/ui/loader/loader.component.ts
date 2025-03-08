import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  imports: [],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderComponent {
	@Input()
	public color: string = '#000';

	@Input()
	public size: number = 80;

	@Input()
	public strokeWidth: number = 3;
}
