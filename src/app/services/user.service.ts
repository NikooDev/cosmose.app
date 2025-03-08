import { inject, Injectable, OnDestroy } from '@angular/core';
import { RestService } from '@Cosmose/services/rest.service';
import { UserEntity } from '@Cosmose/entities/user.entity';
import { Router } from '@angular/router';
import { UserCredential, Auth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateEmail as updateMail,
  updatePassword
} from '@angular/fire/auth';
import { catchError, map, of, Observable, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService extends RestService<UserEntity> implements OnDestroy {
	public user$!: Observable<UserEntity | null>;

	private auth = inject(Auth);
	private router = inject(Router);

	private firstAuthStateChanged = true;

	private subscriptions: Subscription[] = [];

	constructor() {
		super('users');

		this.user$ = this.initUserListener();
	}

	ngOnDestroy() {
		this.subscriptions.forEach(subscription => subscription.unsubscribe());
	}

	/**
	 * @description Initializes the listener for authentication state changes and fetches user data from Firestore.
	 * When the authentication state changes, it retrieves the user data using the user's UID and emits it as an observable.
	 * In case of an error, it will return a null value for the user or propagate the error.
	 *
	 * @private
	 * @returns {Observable<UserEntity>} Observable emitting the user data or an empty object if no user is found.
	 */
	private initUserListener(): Observable<UserEntity> {
		return new Observable<UserEntity>((observer) => {
			const unsubscribe = this.auth.onAuthStateChanged(
				(user) => {
					if (this.firstAuthStateChanged) {
						this.firstAuthStateChanged = false;
						if (!user) {
							return;
						}
					}

					if (user) {
						this._get(user.uid).pipe(
							map((userData) => {
								return new UserEntity(userData);
							}),
							catchError((error) => {
								console.error('Error getting user data', error);
								return of(null);
							})
						).subscribe({
							next: (userData) => {
								if (userData) {
									observer.next(userData);
								} else {
									observer.next({} as UserEntity);
								}
							},
							error: (error) => {
								observer.error(error);
							}
						});
					} else {

					}
				},
				(error) => {
					observer.error(error);
				}
			);

			return () => unsubscribe();
		});
	}

  public async register(user: Partial<UserEntity>, password: string): Promise<void> {

  }

  public async login(email: string, password: string): Promise<UserCredential> {
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  public async updateEmail(oldEmail: string, newEmail: string, password: string): Promise<void> {
    await this.login(oldEmail, password);

    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }

    return await updateMail(currentUser, newEmail);
  }

  public async updatePassword(email: string, oldPassword: string, newPassword: string): Promise<void> {
    await this.login(email, oldPassword);

    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }

    return updatePassword(currentUser, newPassword);
  }

  public async missingPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email);
  }

  public async logout(): Promise<void> {
    await this.router.navigate(['/']);
    return this.auth.signOut();
  }
}
