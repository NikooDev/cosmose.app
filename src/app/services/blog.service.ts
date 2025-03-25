import { Injectable } from '@angular/core';
import { RestService } from '@App/services/rest.service';
import { BlogEntity } from '@App/entities/blog.entity';

@Injectable({
  providedIn: 'root'
})
export class BlogService extends RestService<BlogEntity> {

  constructor() {
		super('blog');
	}
}
