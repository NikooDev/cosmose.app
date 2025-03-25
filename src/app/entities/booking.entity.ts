import { RestEntity } from '@App/entities/rest.entity';
import { StatusBookingEnum } from '@App/types/booking';

export class BookingEntity extends RestEntity {
	public activitiesUID!: string;

	public company!: string;

	public emailMembers!: string[];

	public status!: StatusBookingEnum;

	public startDate!: Date;

	public price!: number;

	public duration!: number;

	public accessLink!: string;

	public note!: string;

	constructor(data: Partial<BookingEntity>) {
		super(data);

		Object.assign(this, data);
	}
}
