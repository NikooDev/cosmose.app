import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export function nonZeroValidator(): ValidatorFn {
	return (control: AbstractControl): ValidationErrors | null => {
		const value = control.value;
		return (isNaN(value) || value <= 0) ? { nonZero: true } : null;
	};
}
