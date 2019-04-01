import {Injectable} from '@angular/core';
import {WebSocketSubject} from "rxjs/webSocket";
import {Subject} from "rxjs";
import {HttpClient} from "@angular/common/http";

export class RetroResults {
  constructor(
    public numResults: number,
    public tempResults: AggregateResults,
    public safetyResults: AggregateResults
  ) { }
}

export class AggregateResults {
  constructor(
    public min: number,
    public max: number,
    public avg: number,
  ) { }
}

@Injectable({
  providedIn: 'root'
})
export class AppService {

  results: Subject<RetroResults>;

  private socket: WebSocketSubject<object>;
  constructor(private http: HttpClient) {
    this.results = new Subject<RetroResults>();
    const protocol = location.protocol === 'https' ? 'wss' : 'ws';
    const url = `${protocol}://${window.location.host}/ws`;
    this.socket = new WebSocketSubject<object>(url);
    this.listen();
  }

  submit(temp: number, safety: number) {
    const msg = {
      temp: temp,
      safety: safety
    };

    this.socket.next(msg);
  }

  listen() {
    this.socket.subscribe(msg => {
      this.results.next(msg as RetroResults);
    }, err => {
      console.error(err);
    });
  }

  clear() {
    this.http.post('clear', null).subscribe( () => {
    });
  }
}
