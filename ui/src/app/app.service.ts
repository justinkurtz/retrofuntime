import { Injectable } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export class ResponseMessage {
    constructor(
        public type: string,
        public retroResults: RetroResults,
        public trueConfessions: string[],
    ) {
    }
}

export class RetroResults {
    constructor(
        public numResults: number,
        public tempResults: AggregateResults,
        public safetyResults: AggregateResults,
        public homelifeResults: AggregateResults,
    ) {
    }
}

export class AggregateResults {
    constructor(
        public min: number,
        public max: number,
        public avg: number,
    ) {
    }
}

@Injectable({
    providedIn: 'root',
})
export class AppService {

    results: Subject<RetroResults>;
    trueConfessions: Subject<string[]>;

    private socket: WebSocketSubject<object>;

    constructor(private http: HttpClient) {
        this.results = new Subject<RetroResults>();
        this.trueConfessions = new Subject<string[]>();

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const url = `${protocol}//${window.location.host}/wsx`;
        this.socket = new WebSocketSubject<object>(url);
        this.listen();
    }

    get videoPlayPreference(): boolean {
        const pref = localStorage.getItem('videoPlayPreference');
        return pref == null || pref === 'true';
    }

    set videoPlayPreference(value: boolean) {
        localStorage.setItem('videoPlayPreference', value.toString());
    }

    submitStats(temp: number, safety: number, homelife: number) {
        const msg = {
            type: 'stats',
            stats: {
                temp: temp,
                safety: safety,
                homelife: homelife,
            },
        };

        this.socket.next(msg);
    }

    submitTrueConfession(trueConfession: string) {
        const msg = {
            type: 'trueConfession',
            trueConfession: trueConfession,
        };

        this.socket.next(msg);
    }

    listen() {
        this.socket.subscribe((msg: ResponseMessage) => {
            switch (msg.type) {
                case 'retroResults':
                    this.results.next(msg.retroResults);
                    break;
                case 'trueConfession':
                    this.trueConfessions.next(msg.trueConfessions);
                    break;
            }
        }, err => {
            console.error(err);
        });
    }

    clear() {
        this.http.post('clear', null).subscribe(() => {
        });
    }
}
