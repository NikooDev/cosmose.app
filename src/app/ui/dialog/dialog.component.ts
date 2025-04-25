import {
	ChangeDetectionStrategy,
	Component,
	effect,
	inject,
	Input,
	signal
} from '@angular/core';
import { DialogService } from '@App/services/dialog.service';
import { NgIf, NgStyle } from '@angular/common';

@Component({
  selector: 'app-dialog',
	imports: [
		NgIf,
		NgStyle
	],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogComponent {
	@Input({ required: true })
	public id!: string;

	@Input()
	public minWidth!: string;

	@Input()
	public maxWidth!: string;

	@Input()
	public maxHeight!: string;

	@Input()
	public overlayClose: boolean = false;

	public isOpen = signal(false);

	private dialogService = inject(DialogService);

	constructor() {
		effect(() => {
			if (this.id) {
				this.isOpen = this.dialogService.isOpen(this.id);
			}
		});
	}

	close() {
		if (this.id) {
			this.dialogService.close(this.id);
		}
	}
}
