import { BrowserModule } from '@angular/platform-browser';
import {LOCALE_ID, NgModule} from '@angular/core';

import { AppComponent } from './app.component';
import {FormsModule} from "@angular/forms";
import {HttpClient, HttpClientModule} from "@angular/common/http";

import localeGb from '@angular/common/locales/en-GB';
import localeAu from '@angular/common/locales/en-AU';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localeGb, 'en-GB');
registerLocaleData(localeAu, 'en-AU');

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    HttpClient,
    { provide: LOCALE_ID, useValue: navigator.language}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
