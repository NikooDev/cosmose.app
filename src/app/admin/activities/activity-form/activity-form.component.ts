import {
	ChangeDetectionStrategy,
	Component,
	effect,
	ElementRef,
	EventEmitter,
	inject,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	signal,
	SimpleChanges,
	ViewChild,
	WritableSignal
} from '@angular/core';
import { DialogComponent } from '@App/ui/dialog/dialog.component';
import { ActivitiesEntity } from '@App/entities/activities.entity';
import { AsyncPipe, NgIf } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { nonZeroValidator } from '@App/validators/nonZero.validator';
import { ComponentBase } from '@App/base/component.base';
import { inputStyle } from '@App/utils/constantes.utils';
import { BehaviorSubject, Subscription } from 'rxjs';
import { UploadService } from '@App/services/upload.service';
import { IconComponent } from '@App/ui/icon/icon.component';
import { closeIcon } from '@App/utils/icons.utils';
import { DialogService } from '@App/services/dialog.service';
import { FirstletterPipe } from '@App/pipes/firstletter.pipe';
import { SwitchComponent } from '@App/ui/switch/switch.component';
import { ToastService } from '@App/services/toast.service';
import { ToastTypeEnum } from '@App/types/ui';
import { ActivityService } from '@App/services/activity.service';
import { v4 as uuid } from 'uuid';
import imageCompression from 'browser-image-compression';
import { delay } from '@App/utils/functions.utils';
import { MasonryService } from '@App/services/masonry.service';
import { ButtonComponent } from '@App/ui/button/button.component';
import { ConfirmComponent } from '@App/ui/confirm/confirm.component';

@Component({
  selector: 'app-activity-form',
	imports: [
		DialogComponent,
		NgIf,
		FormsModule,
		ReactiveFormsModule,
		AsyncPipe,
		IconComponent,
		FirstletterPipe,
		SwitchComponent,
		ButtonComponent,
		ConfirmComponent
	],
  templateUrl: './activity-form.component.html',
  styleUrl: './activity-form.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityFormComponent extends ComponentBase implements OnInit, OnChanges, OnDestroy {
	public activityForm!: FormGroup;

	public picturePreview: string | null = null;

	public picture: File | string | null = null;

	public pictureOriginal: string | null = null;

	public textPending: string = '';

	public $pendingForm: WritableSignal<boolean> = signal(false);

	public $pendingPreviewPicture: WritableSignal<boolean> = signal(false);

	public $activityEnable: WritableSignal<boolean> = signal(true);

	private builder = inject(FormBuilder);

	private uploadService = inject(UploadService);

	private dialogService = inject(DialogService);

	private toastService = inject(ToastService);

	private activityService = inject(ActivityService);

	private masonryService = inject(MasonryService);

	private subscriptions: Subscription[] = [];

	@Input()
	public activity!: ActivitiesEntity | null;

	@Output()
	public reloadItem: EventEmitter<boolean> = new EventEmitter();

	@Output()
	public pendingPictureChange: EventEmitter<{ activityUID: string, isPending: boolean }> = new EventEmitter<{ activityUID: string, isPending: boolean }>();

	@Output()
	public activitiesEnable: EventEmitter<boolean> = new EventEmitter<boolean>();

	@ViewChild('pictureUrl')
	public pictureFile!: ElementRef;

	@ViewChild('title')
	public titleField!: ElementRef;

	protected readonly inputStyle = inputStyle;
	protected readonly closeIcon = closeIcon;

	constructor() {
		super();

		const $isOpen: WritableSignal<boolean> = this.dialogService.isOpen('activityForm');

		effect(() => {
			const isOpen: boolean = $isOpen();

			if (isOpen) {
				setTimeout(() => this.titleField.nativeElement.focus(), 300);
			}
		});
	}

	ngOnInit(): void {
		this.initForm();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['activity']) {
			this.initForm();
		}
	}

	ngOnDestroy() {
		this.subscriptions.forEach(subscription => subscription.unsubscribe());
	}

	/**
	 * @description Init activity form
	 * @returns {void}
	 */
	public initForm(): void {
		this.activityForm = this.builder.group({
			title: [this.getActivity('title', ''), [Validators.required]],
			description: [this.getActivity('description', ''), [Validators.required]],
			playtime: [this.getActivity('playtime', ''), [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/), nonZeroValidator()]],
			minPlayer: [this.getActivity('minPlayer', ''), [Validators.required, Validators.pattern(/^\d+$/), nonZeroValidator()]],
			maxPlayer: [this.getActivity('maxPlayer', ''), [Validators.required, Validators.pattern(/^\d+$/), nonZeroValidator()]],
			price: [this.getActivity('price', ''), [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/), nonZeroValidator()]],
			enable: [this.getActivity('enable', true)]
		});

		if (this.activity) {
			this.$activityEnable.set(this.activity.enable);
			this.picturePreview = this.activity.pictureUrl;
			this.pictureOriginal = this.activity.pictureUrl;
			this.picture = this.activity.pictureUrl;
		} else {
			this.$activityEnable.set(true);
			this.picturePreview = null;
			this.pictureOriginal = null;
			this.picture = null;
		}
	}

	/**
	 * @description Check is form changed
	 * @returns {boolean}
	 */
	public isFormChanged(): boolean {
		if (!this.activity) {
			return this.activityForm.dirty && this.picture !== null;
		}

		const hasFormChanged = Object.keys(this.activityForm.controls).some(key => {
			return this.activityForm.get(key)?.value !== this.activity?.[key as keyof ActivitiesEntity];
		});

		const hasPictureChanged = (this.pictureOriginal !== this.picture) || (this.pictureOriginal !== null && this.picture === null);

		return (hasFormChanged || hasPictureChanged) && this.picture !== null;
	}

	/**
	 * @description Get property activity entity
	 * @returns {string | number | boolean | (() => Partial<ActivitiesEntity>) | Date}
	 */
	public getActivity(property: keyof ActivitiesEntity, defaultValue: string | boolean): string | number | boolean | (() => Partial<ActivitiesEntity>) | Date {
		if (this.activity) {
			return this.activity[property];
		} else {
			return defaultValue;
		}
	}

	/**
	 * @description Show preview picture / Save file
	 * @returns {void}
	 */
	public previewPicture(event: Event): void {
		const target = event.target as HTMLInputElement;
		const MAX_FILE_SIZE = 10 * 1024 * 1024;

		this.$pendingPreviewPicture.set(true);

		if (target && target.files) {
			const file = target.files[0];

			if (!file) {
				this.toastService.open(ToastTypeEnum.ERROR, 'Une erreur est survenue.\nVeuillez rééssayer.');
				this.$pendingPreviewPicture.set(false);
				return;
			}

			if (file.size > MAX_FILE_SIZE) {
				this.toastService.open(ToastTypeEnum.ERROR, 'L\'image est trop volumineuse. Veuillez choisir une image de moins de 5 Mo.');
				this.$pendingPreviewPicture.set(false);
				return;
			}

			this.picture = file;

			if (file && file.type.startsWith('image/webp')) {
				const reader = new FileReader();

				reader.onload = () => {
					this.picturePreview = reader.result as string;
					this.$pendingPreviewPicture.set(false);
					this.pictureFile.nativeElement.value = null;
				};

				reader.readAsDataURL(file);
			} else {
				this.toastService.open(ToastTypeEnum.ERROR, 'Ce fichier n\'est pas une image\nFormat autorisé : WEBP');
			}
		}
	}

	/**
	 * @description Remove picture
	 * @returns {void}
	 */
	public deletePicture(event: MouseEvent): void {
		event.preventDefault();

		this.picturePreview = null;
		this.pictureOriginal = null;
		this.picture = null;
		this.pictureFile.nativeElement.value = '';
	}

	/**
	 * @description Toggle activity enable/disable
	 * @returns {void}
	 */
	public toggleActivityEnable(value: boolean): void {
		const enableField = this.activityForm.get('enable') as AbstractControl<boolean, boolean>;

		enableField.patchValue(value);
		this.$activityEnable.set(value);
	}

	/**
	 * @description Get progress percentage value
	 * @returns {BehaviorSubject<number>}
	 */
	public getProgressFile(): BehaviorSubject<number> {
		return this.uploadService.uploadProgress$;
	}

	/**
	 * @description Compress & resize picture
	 * @param image
	 * @private
	 * @returns {Promise<File>}
	 */
	private async compressAndResizeImage(image: File): Promise<File> {
		try {
			const options = {
				maxWidthOrHeight: 1024,
				maxSizeMB: 1,
				useWebWorker: true
			};

			this.textPending = 'Compression...';
			this.cdr.detectChanges();

			const { promise } = delay(1000);
			await promise;

			return await imageCompression(image, options);
		} catch (error) {
			console.error('Erreur lors de la compression ou du redimensionnement de l\'image', error);
			throw error;
		}
	}

	/**
	 * @description Submit activity form
	 * @returns {Promise<void>}
	 */
	public async submit(): Promise<void> {
		const valid = this.validationErrors();

		if (valid) {
			this.$pendingForm.set(true);
			const activity = this.activityForm.getRawValue() as ActivitiesEntity;

			try {
				if (this.picture && this.picture instanceof File) {
					if (this.activity) {
						this.pendingPictureChange.emit({ activityUID: this.activity.uid, isPending: true });
						this.textPending = 'Mise à jour...';

						await this.uploadService.deleteFile(`activities/${this.activity.pictureName}`);
					}

					const newPicture = this.picture as File;
					const filename = uuid();

					const compressedPicture = await this.compressAndResizeImage(newPicture);
					const filePath = `activities/${filename}`;

					this.textPending = 'Upload...';
					activity.pictureUrl = await this.uploadService.uploadFile(compressedPicture, filePath);
					activity.pictureName = filename;

					const { promise: promiseUpload } = delay(1000);
					await promiseUpload;
				} else {
					this.textPending = activity.enable ? 'Publication...' : 'Modification...';
				}

				const activityEntity = new ActivitiesEntity(activity).serialize();

				if (this.activity) {
					this.textPending = activity.enable ? 'Publication...' : 'Modification...';

					const { promise } = delay(1000);
					await promise;

					await this.activityService.update({
						...activityEntity,
						uid: this.activity.uid,
						pictureName: activity.pictureName ?? this.activity.pictureName,
						pictureUrl: activity.pictureUrl ?? this.activity.pictureUrl,
						created: this.activity.created,
						updated: new Date()
					});
				} else {
					this.textPending = activity.enable ? 'Publication...' : 'Création...';

					const { promise } = delay(1000);
					await promise;

					await this.activityService.create(activityEntity);
				}

				this.dialogService.close('activityForm');

				if (this.activity) {
					if (this.activity.enable !== activity.enable) {
						this.activitiesEnable.emit(activity.enable);
					}

					this.toastService.open(ToastTypeEnum.SUCCESS, `L'activité "${activity.title}" a bien été modifiée.`);
				} else {
					this.toastService.open(ToastTypeEnum.SUCCESS, `L'activité "${activity.title}" a bien été créée.`);
				}

				this.textPending = '';
				this.$pendingForm.set(false);
				this.uploadService.uploadProgress$.next(0);
				this.activity = null;

				this.reloadMasonry();
			} catch (error) {
				this.textPending = 'Erreur';
				this.uploadService.uploadProgress$.next(0);
				this.toastService.open(ToastTypeEnum.ERROR, 'Une erreur est survenue.\nContactez le développeur web.');
				this.$pendingForm.set(false);
				console.error(error);
			}
		}
	}

	/**
	 * @description Cancel activity form
	 * @param event
	 * @param dialogID
	 * @returns {void}
	 */
	public cancel(event: MouseEvent, dialogID: string): void {
		event.preventDefault();

		this.initForm();

		this.dialogService.close(dialogID);
	}

	/**
	 * @description Confirm delete activity
	 * @param event
	 * @returns {void}
	 */
	public confirmDelete(event: MouseEvent): void {
		event.preventDefault();

		this.dialogService.open('deleteActivity');
	}

	/**
	 * @description Delete activity
	 * @param event
	 * @param activityUID
	 * @returns {Promise<void>}
	 */
	public async delete(event: MouseEvent, activityUID: string): Promise<void> {
		event.preventDefault();

		if (this.activity) {
			await this.uploadService.deleteFile(`activities/${this.activity.pictureName}`);
			await this.activityService.delete(activityUID);

			this.dialogService.close('deleteActivity');
			this.dialogService.close('activityForm');

			this.toastService.open(ToastTypeEnum.SUCCESS, `L'activité "${this.activity.title}" a bien été supprimée.`);

			this.reloadMasonry();
		}
	}

	/**
	 * @description Check validator activity form
	 * @private
	 * @returns {boolean}
	 */
	private validationErrors(): boolean {
		const errors = [
			{field: 'title', message: 'Le titre est requis.'},
			{field: 'description', message: 'La description est requise.'},
			{field: 'minPlayer', message: 'Le nombre minimum de joueurs est requis et doit être un nombre.'},
			{field: 'maxPlayer', message: 'Le nombre maximum de joueurs est requis et doit être un nombre.'},
			{field: 'playtime', message: 'La durée de jeu est requise et doit être un nombre.'},
			{field: 'price', message: 'Le prix est requis et doit être un nombre.'}
		];

		for (const error of errors) {
			const control = this.activityForm.get(error.field);
			const value = control?.value;

			if (control?.invalid) {
				this.showErrorMessage(error.message);
				return false;
			}

			if (['minPlayer', 'maxPlayer', 'playtime', 'price'].includes(error.field)) {
				const numericValue = Number(value);
				const isMaxPlayer = error.field === 'maxPlayer';
				const controlMinPlayer = this.activityForm.get('minPlayer');
				const valueMinPlayer = controlMinPlayer?.value;

				if (isNaN(numericValue) || numericValue <= 0) {
					this.showErrorMessage(error.message);
					return false;
				}

				if (isMaxPlayer && value < valueMinPlayer) {
					this.showErrorMessage('Le nombre maximum de joueurs doit être supérieur ou égal au nombre minimum.');
					return false;
				}
			}
		}

		if (!this.picture) {
			this.showErrorMessage('Vous devez ajouter une photo.');
			return false;
		}

		this.activityForm.markAllAsTouched();
		return true;
	}

	/**
	 * @description Display error message
	 * @param message
	 * @private
	 * @returns {void}
	 */
	private showErrorMessage(message: string): void {
		this.toastService.open(ToastTypeEnum.ERROR, message, undefined, {duration: 3000, unique: true});
	}

	private reloadMasonry(): void {
		const masonry = this.masonryService.getMasonry();

		if (masonry) {
			const itemsLoaded$ = masonry.itemsLoaded.subscribe(() => {
				this.reloadItem.emit(true);
			});

			this.subscriptions.push(itemsLoaded$);
		}
	}
}
