import { Component, OnInit } from '@angular/core';
import { AppService, RetroResults } from './app.service';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('disappear', [
      state('void', style({
        opacity: 0
      })),
      transition('void <=> *', animate(350))
    ]),
    trigger('slideOut', [
      transition(':leave', [
        animate('350ms', style({
          height: 0, margin: 0, padding: 0, opacity: 0
        }))
      ])
    ])
  ]
})
export class AppComponent implements OnInit {
  results: RetroResults;
  trueConfessions: string[];
  submitted = false;
  submittedTrueConfession = false;
  temp = 3;
  safety = 3;
  trueConfession = '';
  videoPlaying = true;

  constructor(private appService: AppService) {
  }

  ngOnInit() {
    this.videoPlaying = this.appService.videoPlayPreference;
    this.appService.results.subscribe(r => {
      this.results = r;
      if (!r || r.numResults == 0) {
        this.submitted = false;
      }
    });

    this.appService.trueConfessions.subscribe(r => {
      this.trueConfessions = r;
      if (!r || r.length == 0) {
        this.submittedTrueConfession = false;
      }
    });
  }

  submit(event) {
    this.submitted = true;
    this.appService.submitTempSafety(this.temp, this.safety);
    event.preventDefault();
  }

  clear() {
    if (confirm('Clearing results for everyone. Are you sure?')) {
      this.appService.clear();
    }
  }

  toggleVideo(video: HTMLVideoElement) {
    if (this.videoPlaying) {
      video.pause();
    } else {
      video.play();
    }
    this.videoPlaying = !this.videoPlaying;
    this.appService.videoPlayPreference = this.videoPlaying;
  }

  submitTrueConfession() {
    this.appService.submitTrueConfession(this.trueConfession);
    this.trueConfession = '';
    this.submittedTrueConfession = true;
  }
}
