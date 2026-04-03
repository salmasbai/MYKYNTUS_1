import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { PrimeModule } from './features/prime/prime.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, PrimeModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

