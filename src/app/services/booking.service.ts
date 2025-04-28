import { Injectable } from '@angular/core';
import {RestService} from '@App/services/rest.service';
import {BookingEntity} from '@App/entities/booking.entity';

@Injectable({
  providedIn: 'root'
})
export class BookingService extends RestService<BookingEntity> {
  constructor() {
		super('bookings');
	}
}
