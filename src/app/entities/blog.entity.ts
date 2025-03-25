import { RestEntity } from '@App/entities/rest.entity';

export class BlogEntity extends RestEntity {
	public title!: string;

	public subtitle!: string;

	public content!: string;

	public coverImage!: string;

	public coverName!: string;

	constructor(data: Partial<BlogEntity>) {
		super(data);

		if (!data.created) {
			this.created = new Date();
		}
		if (!data.updated) {
			this.updated = new Date();
		}

		Object.assign(this, data);
	}


	public serialize(): Partial<BlogEntity> {
		return {
			title: this.title,
			subtitle: this.subtitle,
			content: this.content,
			coverImage: this.coverImage,
			created: this.created,
			updated: this.updated
		};
	}
}
