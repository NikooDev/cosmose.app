import {RestEntity} from '@App/entities/rest.entity';
import {Timestamp} from 'firebase/firestore';

export class RoomEntity extends RestEntity {
	public company!: boolean;

	public endDate!: Date;

	public roomID!: string;

	constructor(data: Partial<RoomEntity>) {
		super(data);

		if (data.endDate instanceof Timestamp) {
			data.endDate = data.endDate.toDate();
		}

		Object.assign(this, data);
	}
}
