import { MoodsService, Mood } from "../services/moods";
import { autoinject } from 'aurelia-framework';
import { RestApi } from './../services/rest-api';
import { EventAggregator, Subscription } from 'aurelia-event-aggregator';

@autoinject()
export class SuperStars {
    public selectedMoods: Mood[];
    public selectedGroupBy: string;

    private _eventAggregator: EventAggregator;
    private _subscriptions: Subscription[];
    protected _api: RestApi;

    public isLoading: boolean;
    public groups: Group[];

    constructor(moodsService: MoodsService, api: RestApi, eventAggregator: EventAggregator) {
        this.selectedMoods = [moodsService.moods[0]];
        this.selectedGroupBy = 'Day';
        this._api = api;
        this._eventAggregator = eventAggregator;
        this._subscriptions = [];
    }

    attached(): void {
        this.isLoading = true;
        this._subscriptions.push(this._eventAggregator.subscribe('moods_selection', this.selectionChanged));
        this._subscriptions.push(this._eventAggregator.subscribe('groups_selection', this.selectionChanged));

        this._api.get<Group[]>(`highlights/faces?mood=${this.selectedMoods[0].name}&groupBy=${this.selectedGroupBy}`)
            .then(data => {
                this.groups = data;
                this.isLoading = false;
            });
    }

    private selectionChanged(): void {
        this.isLoading = true;
        this._api.get<Group[]>(`highlights/faces?mood=${this.selectedMoods[0].name}&groupBy=${this.selectedGroupBy}`)
            .then(data => {
                this.groups = data;
                this.isLoading = false;
            });
    }

    detached(): void {
        if (this._subscriptions != null) {
            this._subscriptions.forEach(s => s.dispose());
        }
    }
}

interface Group {
    startDate: Date;
    faces: Face[];
}

interface Face {
    url: string;
    score: number;
    date: Date;
}

