import {
	ChangeDetectionStrategy,
	Component, EventEmitter, HostListener,
	inject,
	Input,
	OnInit, Output,
	signal,
	WritableSignal
} from '@angular/core';
import { FirstletterPipe } from '@App/pipes/firstletter.pipe';
import { IconComponent } from '@App/ui/icon/icon.component';
import { TableComponent } from '@App/ui/table/table.component';
import { TooltipComponent } from '@App/ui/tooltip/tooltip.component';
import { moreIcon } from '@App/utils/icons.utils';
import { StatusUserEnum, UsersCompanyInterface } from '@App/types/user';
import { TableColumn } from '@App/types/ui';
import { UserEntity } from '@App/entities/user.entity';
import { AsyncPipe, NgIf } from '@angular/common';
import { DialogService } from '@App/services/dialog.service';
import { BehaviorSubject } from 'rxjs';
import { ConfirmComponent } from '@App/ui/confirm/confirm.component';
import { DropdownComponent, DropdownItemComponent } from '@App/ui/dropdown/dropdown.component';
import { ButtonComponent } from '@App/ui/button/button.component';
import { ComponentBase } from '@App/base/component.base';

@Component({
  selector: 'app-user-table',
	imports: [
		FirstletterPipe,
		IconComponent,
		TableComponent,
		TooltipComponent,
		AsyncPipe,
		ConfirmComponent,
		NgIf,
		DropdownComponent,
		ButtonComponent,
		DropdownItemComponent
	],
	providers: [FirstletterPipe],
  templateUrl: './user-table.component.html',
  styleUrl: './user-table.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserTableComponent extends ComponentBase implements OnInit {
	public displayedColumns: TableColumn<UserEntity>[] = [];

	public usersSelected$: BehaviorSubject<UsersCompanyInterface | null> = new BehaviorSubject<UsersCompanyInterface | null>(null);

	public $usersOptions: WritableSignal<boolean> = signal(false);

	private firstLetterPipe = inject(FirstletterPipe);

	private dialogService = inject(DialogService);

	@Input()
	public userCompany!: UsersCompanyInterface;

	@Output()
	public deleteUsers: EventEmitter<{ event: MouseEvent, users: UserEntity[] }> = new EventEmitter();

	@Output()
	public userDisplay: EventEmitter<string> = new EventEmitter();

	protected readonly moreIcon = moreIcon;

	constructor() {
		super();
	}

	ngOnInit() {
		this.initColumns();
	}

	@HostListener('document:click', ['$event'])
	public onClick(event: MouseEvent) {
		const clickedInside = (event.target as HTMLElement).closest('[data-users-options]');
		if (!clickedInside) {
			this.$usersOptions.set(false);
		}
	}

	public initColumns() {
		this.displayedColumns = [
			{
				label: 'Nom - Prénom',
				key: 'lastname',
				type: 'string',
				width: '280px',
				transformer: (data) => {
					return this.firstLetterPipe.transform(data.lastname)+' '+this.firstLetterPipe.transform(data.firstname);
				}
			},
			{
				label: 'Adresse e-mail',
				key: 'email',
				type: 'string'
			},
			{
				label: 'Statut',
				key: 'status',
				type: 'string',
				width: '140px',
				transformer: (data) => {
					if (data.status === StatusUserEnum.ONLINE) {
						return 'Connecté'
					} else {
						return 'Déconnecté'
					}
				}
			},
			{
				label: 'Date de création',
				key: 'created',
				type: 'date',
				width: '180px'
			}
		];
	}

	public showUsersOptions() {
		this.$usersOptions.set(true);
	}

	public confirmDeleteUsers(users: { company: string, users: UserEntity[] }) {
		this.usersSelected$.next(users);
		this.$usersOptions.set(false);

		this.dialogService.open('deleteUsers');
	}

	public getButtonClasses(): string {
		return `bg-white hover:bg-theme-400 hover:text-white rounded-lg !px-1 !py-0 shadow-md ${this.$usersOptions() ? '!bg-theme-400 text-white' : ''}`;
	}
}
