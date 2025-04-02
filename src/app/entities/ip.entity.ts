import { RestEntity } from '@App/entities/rest.entity';

export class IpEntity extends RestEntity {
	public allow!: boolean;

	public ip!: string;

	public userUID!: string;
}
