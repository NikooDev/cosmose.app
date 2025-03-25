import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class IpService {
	private ipApiUrl = 'https://api.ipify.org?format=json';

	private http = inject(HttpClient);

	public getIp(): Observable<{ ip: string }> {
		return this.http.get<{ ip: string }>(this.ipApiUrl);
	}
}
