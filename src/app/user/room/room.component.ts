import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {NgIf} from '@angular/common';
import {FirstletterPipe} from '@App/pipes/firstletter.pipe';
import {SwitchComponent} from '@App/ui/switch/switch.component';
import {ButtonComponent} from '@App/ui/button/button.component';

@Component({
  selector: 'app-room',
	imports: [
		NgIf,
		FirstletterPipe,
		SwitchComponent,
		ButtonComponent
	],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoomComponent {
	@Input()
	public company!: string | undefined;

	@Output()
	public roomState = new EventEmitter<void>();
}
