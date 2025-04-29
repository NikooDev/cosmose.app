import { inject, Injectable, OnDestroy } from '@angular/core';
import { catchError, map, Observable, of, ReplaySubject, Subscription } from 'rxjs';
import { UserEntity } from '@App/entities/user.entity';
import { RestService } from '@App/services/rest.service';
import {
	Auth,
	createUserWithEmailAndPassword,
	sendPasswordResetEmail,
	signInWithEmailAndPassword,
	updateEmail,
	updatePassword,
	UserCredential
} from '@angular/fire/auth';
import { redirectToHome } from '@App/utils/functions.utils';
import { HttpClient } from '@angular/common/http';
import { RoleUserEnum, StatusUserEnum } from '@App/types/user';
import { environment } from '@/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService extends RestService<UserEntity> implements OnDestroy {
	public user$ = new ReplaySubject<UserEntity | null>(1);

	private auth = inject(Auth);

	private httpClient = inject(HttpClient);

	private subscriptions: Subscription[] = [];

	private readonly dbName = 'firebaseLocalStorageDb';

	private readonly storeName = 'firebaseLocalStorage';

	private readonly serverUrl = environment.production ? 'https://cosmoseserver.vercel.app' : 'http://localhost:8121';

  constructor() {
		super('users');

		this.initUserListener();

		const user$ = this.user$.subscribe(user => {
			if (user) {
				const checkUser$ = this.checkUser().subscribe({
					next: (result) => {
						if (!result) {
							this.user$.next(null);
							this.logout().then();
						}
					},
					error: (error) => {
						console.error('Erreur lors de la vérification de l\'utilisateur', error);
					}
				});

				this.subscriptions.push(checkUser$);
			}
		});

		this.subscriptions.push(user$);
	}

	ngOnDestroy() {
		this.subscriptions.forEach(subscription => subscription.unsubscribe());
	}

	private checkUser(): Observable<boolean> {
		return new Observable<boolean>((observer) => {
			const request = indexedDB.open(this.dbName);

			request.onsuccess = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;
				const transaction = db.transaction(this.storeName, 'readonly');
				const store = transaction.objectStore(this.storeName);
				const getRequest = store.getAll();

				getRequest.onsuccess = () => {
					const data = getRequest.result;
					observer.next(data.length > 0);
					observer.complete();
				};

				getRequest.onerror = () => {
					observer.error('Erreur lors de la lecture d\'IndexedDB');
				};
			};

			request.onerror = () => {
				observer.error('Erreur lors de l\'ouverture d\'IndexedDB');
			};
		});
	}

	/**
	 * @description Initializes the listener for authentication state changes and fetches user data from Firestore.
	 * When the authentication state changes, it retrieves the user data using the user's UID and emits it as an observable.
	 * In case of an error, it will return a null value for the user or propagate the error.
	 *
	 * @private
	 * @returns {void} Observable emitting the user data or an empty object if no user is found.
	 */
	private initUserListener(): void {
		this.auth.onAuthStateChanged(user => {
			if (user) {
				this._get(user.uid).pipe(
					map(userData => new UserEntity(userData)),
					catchError(error => {
						console.error('Error getting user data', error);
						return of(null);
					})
				).subscribe({
					next: (userData) => {
						if (userData && userData.revoked) {
							this.update({ uid: userData.uid, status: StatusUserEnum.OFFLINE }).then(() => {
								this.user$.next(null);
								this.logout().then();
							});
						} else {
							this.user$.next(userData);
						}
					},
					error: (error) => this.user$.error(error)
				});
			} else {
				this.user$.next(null);
			}
		});
	}

	public async register(email: string, password: string): Promise<UserCredential> {
		return await createUserWithEmailAndPassword(this.auth, email, password);
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

		return await updateEmail(currentUser, newEmail);
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
		await this.auth.signOut();
		redirectToHome();
	}

	public createUser(email: string, password: string): Observable<{ success: boolean; uid: string }> {
		return this.httpClient.post<{ success: boolean; uid: string }>(`${this.serverUrl}/create/user`, { email, password });
	}

	public createAdmin(email: string, password: string, publicAddress: string): Observable<{ success: boolean; uid: string }> {
		return this.httpClient.post<{ success: boolean; uid: string }>(`${this.serverUrl}/create/admin`, { email, password, publicAddress });
	}

	public deleteUser(userUID: string): Observable<{ success: boolean }> {
		return this.httpClient.delete<{ success: boolean }>(`${this.serverUrl}/delete/users/${userUID}`);
	}

	public deleteUsers(users: UserEntity[]): Observable<{ success: boolean }> {
		return this.httpClient.delete<{ success: boolean }>(`${this.serverUrl}/delete/users`, { body: users });
	}

	public updateUser(userUID: string, role: RoleUserEnum[], newEmail: string | undefined, password: string | undefined, publicAddress: string | undefined, revoked: boolean | undefined): Observable<{ success: boolean }> {
		return this.httpClient.patch<{ success: boolean }>(`${this.serverUrl}/update/user`, { userUID, role, newEmail, password, publicAddress, revoked });
	}

	public revokeUser(userUID: string): Observable<{ success: boolean }> {
		return this.httpClient.post<{ success: boolean }>(`${this.serverUrl}/revoke/user`, { userUID });
	}

	public unRevokeUser(userUID: string): Observable<{ success: boolean }> {
		return this.httpClient.post<{ success: boolean }>(`${this.serverUrl}/unrevoke/user`, { userUID });
	}
}
