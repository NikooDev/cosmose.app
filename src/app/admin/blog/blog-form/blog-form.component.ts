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
import { AsyncPipe, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { BlogEntity } from '@App/entities/blog.entity';
import { ComponentBase } from '@App/base/component.base';
import { inputStyle } from '@App/utils/constantes.utils';
import { closeIcon } from '@App/utils/icons.utils';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UploadService } from '@App/services/upload.service';
import { DialogService } from '@App/services/dialog.service';
import { ToastService } from '@App/services/toast.service';
import { MasonryService } from '@App/services/masonry.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { BlogService } from '@App/services/blog.service';
import { ButtonComponent } from '@App/ui/button/button.component';
import { fade } from '@App/utils/animations.utils';
import { ToastTypeEnum } from '@App/types/ui';
import { IconComponent } from '@App/ui/icon/icon.component';
import { delay } from '@App/utils/functions.utils';
import imageCompression from 'browser-image-compression';
import { ConfirmComponent } from '@App/ui/confirm/confirm.component';
import { FirstletterPipe } from '@App/pipes/firstletter.pipe';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-blog-form',
	imports: [
		DialogComponent,
		NgIf,
		FormsModule,
		ReactiveFormsModule,
		ButtonComponent,
		NgSwitch,
		NgSwitchCase,
		AsyncPipe,
		IconComponent,
		ConfirmComponent,
		FirstletterPipe
	],
  templateUrl: './blog-form.component.html',
  styleUrl: './../../activities/activity-form/activity-form.component.scss',
	animations: [fade],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogFormComponent extends ComponentBase implements OnInit, OnChanges, OnDestroy {
	public blogForm!: FormGroup;

	public picturePreview: string | null = null;

	public picture: File | string | null = null;

	public pictureOriginal: string | null = null;

	public textPending: string = '';

	public steps: number = 0;

	private builder = inject(FormBuilder);

	private uploadService = inject(UploadService);

	private dialogService = inject(DialogService);

	private toastService = inject(ToastService);

	private masonryService = inject(MasonryService);

	private blogService = inject(BlogService);

	private subscriptions: Subscription[] = [];

	public $pendingForm: WritableSignal<boolean> = signal(false);

	public $pendingPreviewPicture: WritableSignal<boolean> = signal(false);

	@Input({ required: true })
	public article!: BlogEntity | null;

	@Output()
	public reloadItem: EventEmitter<boolean> = new EventEmitter();

	@Output()
	public pendingPictureChange: EventEmitter<{ blogUID: string, isPending: boolean }> = new EventEmitter<{ blogUID: string, isPending: boolean }>();

	@ViewChild('pictureUrl')
	public pictureFile!: ElementRef;

	@ViewChild('title')
	public titleField!: ElementRef;

	protected readonly inputStyle = inputStyle;
	protected readonly closeIcon = closeIcon;

	constructor() {
		super();

		const $isOpen: WritableSignal<boolean> = this.dialogService.isOpen('blogForm');

		effect(() => {
			const isOpen: boolean = $isOpen();

			if (isOpen) {
				setTimeout(() => this.titleField.nativeElement.focus(), 300);
			}
		});
	}

	ngOnInit() {
		this.initForm();
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes['article']) {
			this.initForm();
		}
	}

	ngOnDestroy() {
		this.subscriptions.forEach(subscription => subscription.unsubscribe());
	}

	public initForm() {
		this.blogForm = this.builder.group({
			title: [this.getBlog('title', ''), [Validators.required]],
			subtitle: [this.getBlog('subtitle', ''), []],
			content: [this.getBlog('content', ''), [Validators.required]]
		});

		if (this.article) {
			this.picturePreview = this.article.coverImage;
			this.pictureOriginal = this.article.coverImage;
			this.picture = this.article.coverImage;
		} else {
			this.picturePreview = null;
			this.pictureOriginal = null;
			this.picture = null;
		}
	}

	public isFormChanged(): boolean {
		if (!this.article) {
			return this.blogForm.dirty && this.picture !== null;
		}

		const hasFormChanged = Object.keys(this.blogForm.controls).some(key => {
			return this.blogForm.get(key)?.value !== this.article?.[key as keyof BlogEntity];
		});

		const hasPictureChanged = (this.pictureOriginal !== this.picture) || (this.pictureOriginal !== null && this.picture === null);

		return (hasFormChanged || hasPictureChanged) && this.picture !== null;
	}

	public getBlog(property: keyof BlogEntity, defaultValue: string | boolean): string | number | boolean | (() => Partial<BlogEntity>) | Date {
		if (this.article) {
			return this.article[property];
		} else {
			return defaultValue;
		}
	}

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

	public deletePicture(event: MouseEvent): void {
		event.preventDefault();

		this.picturePreview = null;
		this.pictureOriginal = null;
		this.picture = null;
		this.pictureFile.nativeElement.value = '';
	}

	public getProgressFile(): BehaviorSubject<number> {
		return this.uploadService.uploadProgress$;
	}

	public nextStep() {
		this.steps++;
	}

	public prevStep() {
		this.steps--;
	}

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

	public async submit() {
		const valid = this.validationErrors();

		if (valid) {
			this.$pendingForm.set(true);
			const { title, subtitle, content, ...blogForm } = this.blogForm.getRawValue() as Partial<BlogEntity>;

			try {
				if (this.picture && this.picture instanceof File) {
					if (this.article) {
						this.pendingPictureChange.emit({ blogUID: this.article.uid, isPending: true });
						this.textPending = 'Mise à jour...';

						await this.uploadService.deleteFile(`activities/${this.article.coverName}`);
					}

					const newPicture = this.picture as File;
					const filename = uuid();

					const compressedPicture = await this.compressAndResizeImage(newPicture);
					const filePath = `activities/${filename}`;

					this.textPending = 'Upload...';
					blogForm.coverImage = await this.uploadService.uploadFile(compressedPicture, filePath);
					blogForm.coverName = filename;

					const { promise: promiseUpload } = delay(1000);
					await promiseUpload;
				} else {
					this.textPending = 'Publication...';
				}

				const blogEntity = new BlogEntity({
					...blogForm,
					title, subtitle, content
				}).serialize();

				if (this.article) {
					this.textPending = 'Publication...';

					const { promise } = delay(1000);
					await promise;

					await this.blogService.update({
						uid: this.article.uid,
						title: title ?? this.article.title,
						subtitle: subtitle ?? this.article.subtitle,
						content: content ?? this.article.content,
						coverName: blogForm.coverName ?? this.article.coverName,
						coverImage: blogForm.coverImage ?? this.article.coverImage,
						created: this.article.created,
						updated: new Date()
					});
				} else {
					this.textPending = 'Publication...';

					const { promise } = delay(1000);
					await promise;

					await this.blogService.create(blogEntity);
				}

				this.steps = 0;
				this.dialogService.close('blogForm');

				if (this.article) {
					this.toastService.open(ToastTypeEnum.SUCCESS, `L'article "${title}" a bien été modifié.`);
				} else {
					this.toastService.open(ToastTypeEnum.SUCCESS, `L'article "${title}" a bien été créé.`);
				}

				this.textPending = '';
				this.$pendingForm.set(false);
				this.uploadService.uploadProgress$.next(0);
				this.article = null;

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

	private validationErrors(): boolean {
		const errors = [
			{field: 'title', message: 'Le titre est requis.'},
			{field: 'content', message: 'Le contenu de l\'article est requis.'}
		];

		for (const error of errors) {
			const control = this.blogForm.get(error.field);

			if (control?.invalid) {
				this.showErrorMessage(error.message);
				return false;
			}
		}

		if (!this.picture) {
			this.showErrorMessage('Vous devez ajouter une photo.');
			return false;
		}

		this.blogForm.markAllAsTouched();
		return true;
	}

	private showErrorMessage(message: string): void {
		this.toastService.open(ToastTypeEnum.ERROR, message, undefined, {duration: 3000, unique: true});
	}

	public cancel(event: MouseEvent, dialogID: string) {
		event.preventDefault();

		this.initForm();
		this.steps = 0;

		this.dialogService.close(dialogID);
	}

	public confirmDelete(event: MouseEvent): void {
		event.preventDefault();

		this.dialogService.open('deleteBlog');
	}

	public async delete(event: MouseEvent, blogUID: string): Promise<void> {
		event.preventDefault();

		if (this.article) {
			await this.uploadService.deleteFile(`blog/${this.article.coverImage}`);
			await this.blogService.delete(blogUID);

			this.dialogService.close('deleteBlog');
			this.dialogService.close('blogForm');

			this.toastService.open(ToastTypeEnum.SUCCESS, `L'article "${this.article.title}" a bien été supprimé.`);

			this.reloadMasonry();
		}
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
