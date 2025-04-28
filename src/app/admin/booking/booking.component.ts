import {Component, EventEmitter, inject, OnDestroy, OnInit, Output, signal, WritableSignal} from '@angular/core';
import {ComponentBase} from '@App/base/component.base';
import {AsyncPipe, DatePipe, NgIf, NgSwitch, NgSwitchCase, UpperCasePipe} from '@angular/common';
import {element} from '@App/utils/animations.utils';
import {BookingService} from '@App/services/booking.service';
import {BehaviorSubject, Subscription} from 'rxjs';
import {BookingEntity} from '@App/entities/booking.entity';
import {TableColumn, ToastTypeEnum} from '@App/types/ui';
import {FirstletterPipe} from '@App/pipes/firstletter.pipe';
import {TableComponent} from '@App/ui/table/table.component';
import {StatusBookingEnum} from '@App/types/booking';
import {DialogService} from '@App/services/dialog.service';
import {DialogComponent} from '@App/ui/dialog/dialog.component';
import {IconComponent} from '@App/ui/icon/icon.component';
import {activitiesIcon, linkIcon, lockIcon, noteIcon, phoneIcon, timeIcon, unlockIcon} from '@App/utils/icons.utils';
import {ToastService} from '@App/services/toast.service';
import {ButtonComponent} from '@App/ui/button/button.component';
import {LoaderComponent} from '@App/ui/loader/loader.component';

@Component({
  selector: 'app-booking',
	imports: [
		AsyncPipe,
		NgIf,
		TableComponent,
		DialogComponent,
		UpperCasePipe,
		DatePipe,
		IconComponent,
		ButtonComponent,
		NgSwitchCase,
		NgSwitch,
		LoaderComponent
	],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss',
	providers: [FirstletterPipe],
	animations: [element]
})
export class BookingComponent extends ComponentBase implements OnInit, OnDestroy {
	public displayedColumns: TableColumn<BookingEntity>[] = [];

	public bookingService = inject(BookingService);

	public bookingsPending$: BehaviorSubject<BookingEntity[]> = new BehaviorSubject<BookingEntity[]>([]);

	public bookingsConfirmed$: BehaviorSubject<BookingEntity[]> = new BehaviorSubject<BookingEntity[]>([]);

	public bookingsStarted$: BehaviorSubject<BookingEntity[]> = new BehaviorSubject<BookingEntity[]>([]);

	public bookingsCompleted$: BehaviorSubject<BookingEntity[]> = new BehaviorSubject<BookingEntity[]>([]);

	public booking$ = new BehaviorSubject<BookingEntity | null>(null);

	public subscriptions: Subscription[] = [];

	private firstLetterPipe = inject(FirstletterPipe);

	private dialogService = inject(DialogService);

	private toastService = inject(ToastService);

	public $pending: WritableSignal<boolean> = signal(true);

	@Output()
	public bookingDisplay: EventEmitter<string> = new EventEmitter();

	constructor() {
		super();
	}

	ngOnInit() {
		this.initBooking();
		this.initColumns();
	}

	ngOnDestroy() {
		this.subscriptions.forEach(subscription => subscription.unsubscribe());
	}

	public initBooking() {
		const booking$ = this.bookingService._list().subscribe((bookings) => {
			const bookingsEntity = bookings.map(booking => new BookingEntity(booking));

			const pending = bookingsEntity.filter(booking => booking.status === 'pending');
			const started = bookingsEntity.filter(booking => booking.status === 'started');
			const confirmed = bookingsEntity.filter(booking => booking.status === 'confirmed');
			const completedOrCanceled = bookingsEntity.filter(booking => booking.status === 'completed' || booking.status === 'canceled');

			this.bookingsPending$.next(pending);
			this.bookingsStarted$.next(started);
			this.bookingsConfirmed$.next(confirmed);
			this.bookingsCompleted$.next(completedOrCanceled);

			setTimeout(() => this.$pending.set(false), 1000);
		});

		this.subscriptions.push(booking$);
	}

	public showBooking(bookingUID: string | undefined) {
		if (bookingUID) {
			const bookingSelected$ = this.bookingService._get(bookingUID).subscribe((booking) => {
				const bookingEntity = new BookingEntity(booking);

				this.booking$.next(bookingEntity);
			});

			this.subscriptions.push(bookingSelected$);

			this.dialogService.open('bookingDisplay');
		}
	}

	public initColumns() {
		this.displayedColumns = [
			{
				label: 'Organisation',
				key: 'company',
				type: 'string',
				width: '280px',
				transformer: (data) => {
					return this.firstLetterPipe.transform(data.company);
				}
			},
			{
				label: 'Date de début',
				key: 'startDate',
				type: 'date'
			},
			{
				label: 'Activité',
				key: 'activity',
				type: 'string',
				transformer: (data) => {
					const activity = data.activity;

					return activity.title;
				}
			},
			{
				label: 'Statut',
				key: 'status',
				type: 'string',
				transformer: (data) => {
					let status: string = '';

					switch (data.status) {
						case StatusBookingEnum.PENDING:
							status = 'En attente de confirmation';
							break;
						case StatusBookingEnum.STARTED:
							status = 'En cours';
							break;
						case StatusBookingEnum.CANCELED:
							status = 'Annulé';
							break;
						case StatusBookingEnum.COMPLETED:
							status = 'Terminé';
							break;
						case StatusBookingEnum.CONFIRMED:
							status = 'Programmé';
							break;
					}

					return status;
				}
			}
		]
	}

	public cancel() {
		this.dialogService.close('bookingDisplay');
	}

	public canceled() {
		this.cancel();
	}

	public completed() {
		this.cancel();
	}

	public copyText(texte: string) {
		navigator.clipboard.writeText(texte)
			.then(() => {
				this.toastService.open(ToastTypeEnum.SUCCESS, 'Lien copié');
			})
			.catch(err => {
				console.error('Erreur de copie :', err);
			});
	}

	protected readonly timeIcon = timeIcon;
	protected readonly phoneIcon = phoneIcon;
	protected readonly activitiesIcon = activitiesIcon;
	protected readonly noteIcon = noteIcon;
	protected readonly linkIcon = linkIcon;
	protected readonly StatusBookingEnum = StatusBookingEnum;
}
