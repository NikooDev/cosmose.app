import { Component, signal, ViewEncapsulation, WritableSignal } from '@angular/core';
import { ComponentBase } from '@App/base/component.base';
import { AsyncPipe, NgIf } from '@angular/common';
import { element } from '@App/utils/animations.utils';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import frLocale from '@fullcalendar/core/locales/fr';
import timeGridPlugin from '@fullcalendar/timegrid'

@Component({
  selector: 'app-agenda',
	imports: [
		AsyncPipe,
		NgIf,
		FullCalendarModule
	],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss',
	encapsulation: ViewEncapsulation.None,
	animations: [element]
})
export class AgendaComponent extends ComponentBase {
	public calendarOptions: WritableSignal<CalendarOptions> = signal({
		plugins: [
			interactionPlugin,
			dayGridPlugin,
			timeGridPlugin
		],
		timeZone: 'Europe/Paris',
		events: [
			{
				title: 'Socomore',
				start: '2025-03-25T12:30:00-05:00',
				end: '2025-03-25T17:30:00-05:00'
			},
			{
				title: 'SNCF',
				start: '2025-03-26T10:10:00-05:00',
				end: '2025-03-26T11:00:00-05:00'
			}
		],
		selectable: true,
		headerToolbar: {
			start: 'dayGridMonth,timeGridWeek',
			center: 'title',
			end: 'prev,next'
		},
		locale: frLocale
	});

	constructor() {
		super();
	}
}
