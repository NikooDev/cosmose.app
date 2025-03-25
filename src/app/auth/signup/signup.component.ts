import {
	ChangeDetectionStrategy,
	Component,
	inject,
	Input,
	OnInit
} from '@angular/core';
import { CardComponent } from '@App/ui/card/card.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common';
import { inputStyleNexa, isEmailRegex } from '@App/utils/constantes.utils';
import { ButtonComponent } from '@App/ui/button/button.component';

@Component({
  selector: 'app-signup',
	imports: [
		CardComponent,
		ReactiveFormsModule,
		NgOptimizedImage,
		ButtonComponent
	],
  templateUrl: './signup.component.html',
  styleUrl: './../auth.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignupComponent implements OnInit {
	@Input()
	public toggleView!: (event: MouseEvent) => void;

	public signupForm!: FormGroup;

	private formBuilder = inject(FormBuilder);

	protected readonly inputStyle= inputStyleNexa;

	ngOnInit() {
		this.initForm();
	}

	public initForm() {
		this.signupForm = this.formBuilder.group({
			lastname: ['', [Validators.required]],
			firstname: ['', [Validators.required]],
			email: ['', [Validators.pattern(isEmailRegex), Validators.required]],
			password: ['', [Validators.required]]
		});
	}

	public submit() {

	}
}
