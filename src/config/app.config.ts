import { provideExperimentalZonelessChangeDetection, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideAnimations } from '@angular/platform-browser/animations';
import { NgxMasonryModule } from 'ngx-masonry';
import { firebaseConfig } from '@/config/firebase.config';
import { routes } from '@/routes/app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
		provideAnimations(),
		provideHttpClient(),
		provideRouter(routes),
		importProvidersFrom(NgxMasonryModule),
		provideFirebaseApp(() => initializeApp(firebaseConfig)),
		provideAuth(() => getAuth()),
		provideFirestore(() => getFirestore()),
		provideStorage(() => getStorage())
  ]
};
