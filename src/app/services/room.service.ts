import { Injectable } from '@angular/core';
import {RestService} from '@App/services/rest.service';
import {RoomEntity} from '@App/entities/room.entity';

@Injectable({
  providedIn: 'root'
})
export class RoomService extends RestService<RoomEntity> {
  constructor() {
		super('rooms')
	}
}
