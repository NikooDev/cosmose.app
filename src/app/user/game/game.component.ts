import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {RoomComponent} from '@App/user/room/room.component';
import {redirectToHome} from '@App/utils/functions.utils';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {CardComponent} from '@App/ui/card/card.component';
import {ButtonComponent} from '@App/ui/button/button.component';

@Component({
  selector: 'app-game',
	imports: [
		RoomComponent,
		CardComponent,
		ButtonComponent
	],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent implements OnInit, OnDestroy {
	public roomID!: string | undefined;

	public company!: string | undefined;

	private route = inject(ActivatedRoute);

	private subscriptions: Subscription[] = [];

	ngOnInit() {
		this.initRoom();
	}

	ngOnDestroy() {
		this.subscriptions.forEach(subscription => subscription.unsubscribe());
	}

	public initRoom() {
		const route$ = this.route.data.subscribe(({ room }) => {
			if (!room.roomID && !room.company) {
				setTimeout(() => {
					redirectToHome(0);
				}, 1000);
				return;
			}

			this.roomID = room.roomID;
			this.company = room.company;
		});

		this.subscriptions.push(route$);
	}
}
