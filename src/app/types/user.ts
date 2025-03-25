import { UserEntity } from '@App/entities/user.entity';

export enum RoleUserEnum {
	SUPERADMIN = 'superadmin',
	ADMIN = 'admin',
	USER = 'user'
}

export enum StatusUserEnum {
	ONLINE = 'online',
	OFFLINE = 'offline'
}

export interface UsersCompanyInterface {
	company: string
	users: UserEntity[]
}
