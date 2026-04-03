import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { ParrainageModule } from './features/parrainage/parrainage.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, ParrainageModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

