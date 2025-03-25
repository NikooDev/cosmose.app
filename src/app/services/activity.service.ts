import { Injectable } from '@angular/core';
import { RestService } from '@App/services/rest.service';
import { ActivitiesEntity } from '@App/entities/activities.entity';

@Injectable({
  providedIn: 'root'
})
export class ActivityService extends RestService<ActivitiesEntity> {
  constructor() {
		super('activities');
	}
}
