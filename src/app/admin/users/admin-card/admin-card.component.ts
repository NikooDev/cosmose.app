import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CardComponent } from '@App/ui/card/card.component';
import { DatePipe, NgClass, NgIf } from '@angular/common';
import { FirstletterPipe } from '@App/pipes/firstletter.pipe';
import { IconComponent } from '@App/ui/icon/icon.component';
import { ghostIcon, userIcon } from '@App/utils/icons.utils';
import { StatusUserEnum } from '@App/types/user';
import { UserEntity } from '@App/entities/user.entity';

@Component({
  selector: 'app-admin-card',
	imports: [
		CardComponent,
		DatePipe,
		FirstletterPipe,
		IconComponent,
		NgClass,
		NgIf
	],
  templateUrl: './admin-card.component.html',
  styleUrl: './admin-card.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminCardComponent {
	@Input()
	public admin!: UserEntity;

	@Output()
	public userDisplay: EventEmitter<string> = new EventEmitter();

	protected readonly userIcon = userIcon;
	protected readonly StatusUserEnum = StatusUserEnum;
	protected readonly ghostIcon = ghostIcon;
}
