import { AfterViewInit, Component, inject, OnDestroy, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import { ComponentBase } from '@App/base/component.base';
import { AsyncPipe, NgIf } from '@angular/common';
import { element } from '@App/utils/animations.utils';
import { ButtonComponent } from '@App/ui/button/button.component';
import { LoaderComponent } from '@App/ui/loader/loader.component';
import { BehaviorSubject, Subscription } from 'rxjs';
import { BlogEntity } from '@App/entities/blog.entity';
import { NgxMasonryComponent, NgxMasonryModule } from 'ngx-masonry';
import { BlogCardComponent } from '@App/admin/blog/blog-card/blog-card.component';
import { BlogService } from '@App/services/blog.service';
import { MasonryService } from '@App/services/masonry.service';
import { DialogService } from '@App/services/dialog.service';
import { BlogFormComponent } from '@App/admin/blog/blog-form/blog-form.component';

@Component({
  selector: 'app-blog',
	imports: [
		AsyncPipe,
		NgIf,
		ButtonComponent,
		LoaderComponent,
		NgxMasonryModule,
		BlogCardComponent,
		BlogFormComponent
	],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss',
	animations: [element]
})
export class BlogComponent extends ComponentBase implements OnInit, AfterViewInit, OnDestroy {
	public article!: BlogEntity | null;

	public articles$: BehaviorSubject<BlogEntity[]> = new BehaviorSubject<BlogEntity[]>([]);

	public pendingPictureChange: Map<string, BehaviorSubject<boolean>> = new Map<string, BehaviorSubject<boolean>>();

	public $pendingBlog: WritableSignal<boolean> = signal(true);

	private blogService = inject(BlogService);

	private dialogService = inject(DialogService);

	private masonryService = inject(MasonryService);

	private subscriptions: Subscription[] = [];

	@ViewChild(NgxMasonryComponent)
	public masonry!: NgxMasonryComponent;

	constructor() {
		super();
	}

	ngOnInit() {
		this.initBlog();
	}

	ngAfterViewInit() {
		this.masonryService.setMasonryComponent(this.masonry);
		this.masonryService.refreshMasonry();

		const itemsLoaded$ = this.masonry.itemsLoaded.subscribe(() => {
			this.$pendingBlog.set(false);
		});

		this.subscriptions.push(itemsLoaded$);
	}

	ngOnDestroy() {
		this.subscriptions.forEach(subscription => subscription.unsubscribe());
	}

	public initBlog() {
		const blog$ = this.blogService._list().subscribe(articles => {
			const formatArticle = articles.map(article => new BlogEntity({ ...article }));

			this.articles$.next(formatArticle);

			if (articles.length === 0) {
				this.$pendingBlog.set(false);
			}
		});

		this.subscriptions.push(blog$);
	}

	public createArticle(event: Event) {
		event.preventDefault();
		this.article = null;

		this.dialogService.open('blogForm');
	}

	public showArticle(article: BlogEntity) {
		this.article = article;

		this.dialogService.open('blogForm');
	}

	public updatePictureChange(activityUID: string, isPending: boolean) {
		if (!this.pendingPictureChange.has(activityUID)) {
			this.pendingPictureChange.set(activityUID, new BehaviorSubject<boolean>(false));
		}

		this.pendingPictureChange.get(activityUID)?.next(isPending);
	}

	public getLoadingState(activityUID: string): BehaviorSubject<boolean> {
		if (!this.pendingPictureChange.has(activityUID)) {
			this.pendingPictureChange.set(activityUID, new BehaviorSubject<boolean>(false));
		}
		return this.pendingPictureChange.get(activityUID)!;
	}

	public emitReloadItem() {
		this.$pendingBlog.set(true);

		this.masonryService.refreshMasonry();

		setTimeout(() => this.$pendingBlog.set(false), 500);
	}
}
