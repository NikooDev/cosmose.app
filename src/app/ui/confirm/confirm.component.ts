import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ButtonComponent } from '@App/ui/button/button.component';
import { DialogComponent } from '@App/ui/dialog/dialog.component';
import { DialogService } from '@App/services/dialog.service';

@Component({
  selector: 'app-confirm',
	imports: [
		ButtonComponent,
		DialogComponent
	],
  templateUrl: './confirm.component.html',
  styleUrl: './confirm.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmComponent {
	@Input({ required: true })
	public id!: string;

	@Input({ required: true })
	public title!: string;

	@Input({ required: true })
	public subtitle!: string;

	@Input({ required: true })
	public type!: 'delete' | 'confirm';

	@Input()
	public textConfirm: string = 'Confirmer';

	@Input()
	public textCancel: string = 'Annuler';

	@Output()
	public confirmClick: EventEmitter<MouseEvent> = new EventEmitter();

	private dialogService = inject(DialogService);

	public confirm(event: MouseEvent) {
		event.preventDefault();

		if (this.confirmClick) {
			this.confirmClick.emit(event);
		}
	}

	public cancel(event: MouseEvent) {
		event.preventDefault();

		if (this.id) {
			this.dialogService.close(this.id);
		}
	}
}
