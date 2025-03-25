import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BlogEntity } from '@App/entities/blog.entity';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { FirstletterPipe } from '@App/pipes/firstletter.pipe';
import { LoaderComponent } from '@App/ui/loader/loader.component';
import { NgxMasonryModule } from 'ngx-masonry';

@Component({
  selector: 'app-blog-card',
	imports: [
		AsyncPipe,
		DatePipe,
		FirstletterPipe,
		LoaderComponent,
		NgIf,
		NgxMasonryModule
	],
  templateUrl: './blog-card.component.html',
  styleUrl: './blog-card.component.scss'
})
export class BlogCardComponent implements OnInit {
	public randomNumber!: number;

	@Input({ required: true })
	public article!: BlogEntity;

	@Input()
	public pendingPictureChange$!: BehaviorSubject<boolean>;

	@Output()
	public showBlog: EventEmitter<BlogEntity> = new EventEmitter();

	ngOnInit() {
		this.randomNumber = Math.floor(Math.random() * (8 - 3 + 1)) + 3;
	}

	public randomLineClamp() {
		return `-webkit-line-clamp: ${this.randomNumber};display: -webkit-box;-webkit-box-orient: vertical;`;
	}

	public completePictureChange() {
		this.pendingPictureChange$.next(false);
	}
}
