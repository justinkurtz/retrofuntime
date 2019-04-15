import {Component, OnInit} from '@angular/core';
import {AppService, RetroResults} from "./app.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Retro Funtime';
  results: RetroResults;
  submitted = false;
  temp = 3;
  safety = 3;
  videoPlaying = true;

  constructor(private appService: AppService) {
  }

  ngOnInit() {
    this.appService.results.subscribe(r => {
      this.results = r;
      if (!r || r.numResults == 0) {
        this.submitted = false;
      }
    });
  }

  submit() {
    this.submitted = true;
    this.appService.submit(this.temp, this.safety);
  }

  clear() {
    if (confirm("Clearing results for everyone. Are you sure?")) {
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
  }
}
