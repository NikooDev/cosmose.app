import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firstletter'
})
export class FirstletterPipe implements PipeTransform {
	transform(value: string, ..._: unknown[]): string {
		if (!value) return value;
		return value.charAt(0).toUpperCase() + value.slice(1);
	}
}
