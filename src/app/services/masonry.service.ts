import { Injectable } from '@angular/core';
import { NgxMasonryComponent } from 'ngx-masonry';

@Injectable({
  providedIn: 'root'
})
export class MasonryService {
	private masonryComponent!: NgxMasonryComponent;

	public setMasonryComponent(component: NgxMasonryComponent): void {
		this.masonryComponent = component;
	}

	public getMasonry(): NgxMasonryComponent | null {
		if (this.masonryComponent) {
			return this.masonryComponent;
		} else {
			return null;
		}
	}

	public refreshMasonry(): void {
		if (this.masonryComponent) {
			this.masonryComponent.reloadItems();
			this.masonryComponent.layout();
		} else {
			console.log('null');
		}
	}
}
