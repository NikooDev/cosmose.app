import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { firebaseConfig } from '@/config/firebase';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
		provideExperimentalZonelessChangeDetection(),
		provideRouter(routes),
		provideFirebaseApp(() => initializeApp(firebaseConfig)),
		provideAuth(() => getAuth()),
		provideFirestore(() => getFirestore()),
		provideStorage(() => getStorage()),
		provideAnimationsAsync()
	]
};
