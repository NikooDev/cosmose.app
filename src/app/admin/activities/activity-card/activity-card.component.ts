import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output
} from '@angular/core';
import { NgxMasonryModule } from 'ngx-masonry';
import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { ActivitiesEntity } from '@App/entities/activities.entity';
import { FirstletterPipe } from '@App/pipes/firstletter.pipe';
import { LoaderComponent } from '@App/ui/loader/loader.component';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-activity-card',
	imports: [
		NgxMasonryModule,
		NgIf,
		FirstletterPipe,
		LoaderComponent,
		AsyncPipe,
		DatePipe
	],
  templateUrl: './activity-card.component.html',
  styleUrl: './activity-card.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityCardComponent implements OnInit {
	public randomNumber!: number;

	@Input({ required: true })
	public activity!: ActivitiesEntity;

	@Input()
	public pendingPictureChange$!: BehaviorSubject<boolean>;

	@Output()
	public showActivity: EventEmitter<ActivitiesEntity> = new EventEmitter();

	ngOnInit() {
		this.randomNumber = Math.floor(Math.random() * (12 - 3 + 1)) + 3;
	}

	public randomLineClamp() {
		return `-webkit-line-clamp: ${this.randomNumber};display: -webkit-box;-webkit-box-orient: vertical;`;
	}

	public completePictureChange() {
		this.pendingPictureChange$.next(false);
	}
}
