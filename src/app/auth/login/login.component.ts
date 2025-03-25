import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';
import { CardComponent } from '@App/ui/card/card.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { inputStyleNexa, isEmailRegex } from '@App/utils/constantes.utils';
import { NgOptimizedImage } from '@angular/common';
import { ButtonComponent } from '@App/ui/button/button.component';

@Component({
  selector: 'app-login',
	imports: [
		CardComponent,
		ReactiveFormsModule,
		NgOptimizedImage,
		ButtonComponent
	],
  templateUrl: './login.component.html',
  styleUrl: './../auth.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
	@Input()
	public toggleView!: (event: MouseEvent) => void;

	public loginForm!: FormGroup;

	private formBuilder = inject(FormBuilder);

	protected readonly inputStyle= inputStyleNexa;

	ngOnInit() {
		this.initForm();
	}

	public initForm() {
		this.loginForm = this.formBuilder.group({
			email: ['', [Validators.pattern(isEmailRegex), Validators.required]],
			password: ['', [Validators.required]]
		});
	}

	public submit() {

	}
}
