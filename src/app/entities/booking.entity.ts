import { RestEntity } from '@App/entities/rest.entity';
import { StatusBookingEnum } from '@App/types/booking';
import { ActivitiesEntity } from './activities.entity';

export class BookingEntity extends RestEntity {
	public company!: string;

	public emailMembers!: string[];

	public status!: StatusBookingEnum;

	public startDate!: Date;

	public endDate!: Date;

	public price!: number;

	public duration!: number;

	public accessLink!: string;

	public note!: string;

	public activity!: ActivitiesEntity;

	constructor(data: Partial<BookingEntity>) {
		super(data);

		Object.assign(this, data);
	}
}
