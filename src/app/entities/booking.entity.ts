import { RestEntity } from '@App/entities/rest.entity';
import { StatusBookingEnum } from '@App/types/booking';
import { ActivitiesEntity } from './activities.entity';
import {Timestamp} from 'firebase/firestore';

export class BookingEntity extends RestEntity {
	public company!: string;

	public status!: StatusBookingEnum;

	public roomID!: string;

	public phone!: string;

	public startDate!: Date;

	public endDate!: Date;

	public price!: number;

	public duration!: number;

	public accessLink!: string;

	public note!: string;

	public activity!: ActivitiesEntity;

	constructor(data: Partial<BookingEntity>) {
		super(data);

		if (data.startDate instanceof Timestamp) {
			data.startDate = data.startDate.toDate();
		}

		if (data.endDate instanceof Timestamp) {
			data.endDate = data.endDate.toDate();
		}

		Object.assign(this, data);
	}
}
