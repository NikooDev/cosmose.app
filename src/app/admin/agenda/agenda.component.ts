import { Component, signal, WritableSignal } from '@angular/core';
import { ComponentBase } from '@App/base/component.base';
import { AsyncPipe, NgIf } from '@angular/common';
import { element } from '@App/utils/animations.utils';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import frLocale from '@fullcalendar/core/locales/fr';

@Component({
  selector: 'app-agenda',
	imports: [
		AsyncPipe,
		NgIf,
		FullCalendarModule
	],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss',
	animations: [element]
})
export class AgendaComponent extends ComponentBase {
	public calendarOptions: WritableSignal<CalendarOptions> = signal({
		plugins: [
			interactionPlugin,
			dayGridPlugin
		],
		locale: frLocale
	});

	constructor() {
		super();
	}
}
