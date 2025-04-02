import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { RestService } from '@App/services/rest.service';
import { IpEntity } from '@App/entities/ip.entity';

@Injectable({
  providedIn: 'root'
})
export class IpService extends RestService<IpEntity>{
	constructor() {
		super('allowip');
	}

	private ipApiUrl = 'https://api.ipify.org?format=json';

	private http = inject(HttpClient);

	public getIp(): Observable<{ ip: string }> {
		return this.http.get<{ ip: string }>(this.ipApiUrl);
	}
}
