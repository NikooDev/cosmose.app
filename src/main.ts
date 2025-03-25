import { bootstrapApplication } from '@angular/platform-browser';
import { BootstrapComponent } from '@App/bootstrap/bootstrap.component';
import { appConfig } from '@/config/app.config';
import { LogLevel, setLogLevel } from '@angular/fire';

setLogLevel(LogLevel.SILENT);

bootstrapApplication(BootstrapComponent, appConfig)
  .catch((err) => console.error(err));
