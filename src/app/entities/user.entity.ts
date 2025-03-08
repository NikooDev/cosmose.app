import { RestEntity } from '@/app/entities/rest.entity';
import { RoleUserEnum, StatusUserEnum } from '@/app/types/user';

export class UserEntity extends RestEntity {
	public email!: string;

	public firstname!: string;

	public lastname!: string;

	public role!: RoleUserEnum[];

	public status!: StatusUserEnum;

	constructor(data: Partial<UserEntity>) {
		super(data);

		Object.assign(this, data);
	}
}
