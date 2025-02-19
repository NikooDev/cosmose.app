import { inject, Injectable } from '@angular/core';
import { RestService } from '@Cosmose/services/rest.service';
import { UserEntity } from '@Cosmose/entities/user.entity';
import { Router } from '@angular/router';
import { UserCredential, Auth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateEmail as updateMail,
  updatePassword
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class UserService extends RestService<UserEntity> {
  private auth = inject(Auth);
  private router = inject(Router)

  constructor() {
    super('users');
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
