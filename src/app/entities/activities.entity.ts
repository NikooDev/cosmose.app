import { RestEntity } from '@App/entities/rest.entity';

export class ActivitiesEntity extends RestEntity {
	public title!: string;

	public description!: string;

	public pictureUrl!: string;

	public pictureName!: string;

	public playtime!: string;

	public minPlayer!: number;

	public maxPlayer!: number;

	public price!: number;

	public enable!: boolean;

	constructor(data: Partial<ActivitiesEntity>) {
		super(data);

		if (!data.created) {
			this.created = new Date();
		}
		if (!data.updated) {
			this.updated = new Date();
		}

		Object.assign(this, data);
	}

	public serialize(): Partial<ActivitiesEntity> {
		return {
			title: this.title,
			description: this.description,
			pictureName: this.pictureName,
			pictureUrl: this.pictureUrl,
			playtime: this.playtime,
			minPlayer: this.minPlayer,
			maxPlayer: this.maxPlayer,
			price: this.price,
			enable: this.enable,
			created: this.created,
			updated: this.updated
		};
	}
}
