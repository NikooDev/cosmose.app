import { AfterViewInit, Component, inject, OnDestroy, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import { ComponentBase } from '@App/base/component.base';
import { AsyncPipe, NgIf, NgTemplateOutlet } from '@angular/common';
import { element } from '@App/utils/animations.utils';
import { SwitchComponent } from '@App/ui/switch/switch.component';
import { LoaderComponent } from '@App/ui/loader/loader.component';
import { NgxMasonryComponent, NgxMasonryModule } from 'ngx-masonry';
import { ActivityService } from '@App/services/activity.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ActivitiesEntity } from '@App/entities/activities.entity';
import { ActivityCardComponent } from '@App/admin/activities/activity-card/activity-card.component';
import { ActivityFormComponent } from '@App/admin/activities/activity-form/activity-form.component';
import { DialogService } from '@App/services/dialog.service';
import { MasonryService } from '@App/services/masonry.service';
import { TooltipComponent } from '@App/ui/tooltip/tooltip.component';
import { ButtonComponent } from '@App/ui/button/button.component';

@Component({
  selector: 'app-activities',
	imports: [
		NgIf,
		AsyncPipe,
		SwitchComponent,
		LoaderComponent,
		NgTemplateOutlet,
		NgxMasonryModule,
		ActivityCardComponent,
		ActivityFormComponent,
		TooltipComponent,
		ButtonComponent
	],
  templateUrl: './activities.component.html',
  styleUrl: './activities.component.scss',
	animations: [element]
})
export class ActivitiesComponent extends ComponentBase implements OnInit, AfterViewInit, OnDestroy {
	public activity!: ActivitiesEntity | null;

	public activitiesEnable$: BehaviorSubject<ActivitiesEntity[]> = new BehaviorSubject<ActivitiesEntity[]>([]);

	public activitiesDisable$: BehaviorSubject<ActivitiesEntity[]> = new BehaviorSubject<ActivitiesEntity[]>([]);

	public pendingPictureChange: Map<string, BehaviorSubject<boolean>> = new Map<string, BehaviorSubject<boolean>>();

	public $activitiesEnable: WritableSignal<boolean> = signal(true);

	public $pendingActivities: WritableSignal<boolean> = signal(true);

	private activityService = inject(ActivityService);

	private dialogService = inject(DialogService);

	private masonryService = inject(MasonryService);

	private subscriptions: Subscription[] = [];

	@ViewChild(NgxMasonryComponent)
	public masonry!: NgxMasonryComponent;

	constructor() {
		super();
	}

	ngOnInit() {
		this.initActivities();
	}

	ngAfterViewInit() {
		this.masonryService.setMasonryComponent(this.masonry);

		this.reloadItem();

		const itemsLoaded$ = this.masonry.itemsLoaded.subscribe(() => {
			this.$pendingActivities.set(false);
		});

		this.subscriptions.push(itemsLoaded$);
	}

	ngOnDestroy() {
		this.subscriptions.forEach(subscription => subscription.unsubscribe());
	}

	public initActivities() {
		const activities$ = this.activityService._list().subscribe(activities => {
			const activitiesEnabled = activities.filter(activity => activity.enable);
			const activitiesDisabled = activities.filter(activity => !activity.enable);

			if (activitiesEnabled.length === 0) {
				this.$pendingActivities.set(false);
			}

			const formatActivitiesEnabled = activitiesEnabled.map(activity => new ActivitiesEntity({
				...activity,
			}));

			const formatActivitiesDisabled = activitiesDisabled.map(activity => new ActivitiesEntity({
				...activity,
			}));

			this.activitiesEnable$.next(formatActivitiesEnabled);
			this.activitiesDisable$.next(formatActivitiesDisabled);
		});

		this.subscriptions.push(activities$);
	}

	public createActivity(event: Event) {
		event.preventDefault();
		this.activity = null;

		this.dialogService.open('activityForm');
	}

	public showActivity(activity: ActivitiesEntity) {
		this.activity = activity;

		this.dialogService.open('activityForm');
	}

	public toggleActivitiesDisabled(value: boolean) {
		this.$pendingActivities.set(true);
		this.$activitiesEnable.set(value);

		this.reloadItem();

		setTimeout(() => this.$pendingActivities.set(false), 500);
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

	public reloadItem() {
		this.masonryService.refreshMasonry();
	}

	public emitReloadItem() {
		this.$pendingActivities.set(true);

		this.reloadItem();

		setTimeout(() => this.$pendingActivities.set(false), 500);
	}
}
