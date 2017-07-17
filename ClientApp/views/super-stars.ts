import { DialogService } from 'aurelia-dialog';
import { MoodsService, Mood } from "../services/moods";
import { autoinject } from 'aurelia-framework';
import { RestApi } from './../services/rest-api';
import { EventAggregator, Subscription } from 'aurelia-event-aggregator';
import * as moment from 'moment';
import { ModalImage, ImageModel } from '../components/modal-image/modal-image';

@autoinject()
export class SuperStars {
    public selectedMoods: Mood[];
    public selectedGroupBy: string;

    private _eventAggregator: EventAggregator;
    private _subscriptions: Subscription[];
    private _api: RestApi;
    private _dialogService: DialogService;

    public isLoading: boolean;
    public groups: FacesGroup[];

    constructor(moodsService: MoodsService, api: RestApi, eventAggregator: EventAggregator, dialogService: DialogService) {
        this.selectedMoods = [moodsService.moods[0]];
        this.selectedGroupBy = 'DayOfYear';
        this._api = api;
        this._eventAggregator = eventAggregator;
        this._subscriptions = [];
        this._dialogService = dialogService;
    }

    attached(): void {
        this.isLoading = true;
        this._subscriptions.push(this._eventAggregator.subscribe('moods_selection', (m) => this.selectionChanged('moods', m)));
        this._subscriptions.push(this._eventAggregator.subscribe('groups_selection', (m) => this.selectionChanged('groups', m)));

        this._api.get<FacesGroup[]>(`highlights/faces?mood=${this.selectedMoods[0].name}&groupBy=${this.selectedGroupBy}`)
            .then(data => {
                this.groups = data;
                this.isLoading = false;
            });
    }

    private selectionChanged(changeName: string, changedObject: any): void {
        this.isLoading = true;

        if (changeName == 'groups') this.selectedGroupBy = changedObject;

        this._api.get<FacesGroup[]>(`highlights/faces?mood=${this.selectedMoods[0].name}&groupBy=${this.selectedGroupBy}`)
            .then(data => {
                this.groups = data;
                this.isLoading = false;
            });
    }

    private showImage(face: Face): void {
        this._dialogService.open({
            viewModel: ModalImage,
            model: {
                imageUrl: face.url,
                downloadImageUrl: face.originalImage,
                text: `${Math.floor(face.score * 100)}% ${this.selectedMoods[0].name.toLowerCase()} at ${moment(face.date).format('MMMM DD HH:mm')}`
            },
            lock: false
        });
    }

    detached(): void {
        if (this._subscriptions != null) {
            this._subscriptions.forEach(s => s.dispose());
        }
    }
}

export class FaceDateValueConverter {
    toView(value, currentGroup) {
        switch (currentGroup) {
            case 'Day': return moment(value).format('HH:mm');
            case 'Week': return moment(value).format('MMM D HH:mm');
            case 'Month': return moment(value).format('MMM D HH:mm');
            default: return moment(value).format('MMM DD YY H:mm');
        }
    }
}

export class FacesGroupDateValueConverter {
    toView(value, currentGroup) {
        switch (currentGroup) {
            case 'Day': return moment(value).format('MMMM D');
            case 'Week': {
                var weeksAgo: number = moment().diff(moment(value), 'weeks');
                if (weeksAgo == 0)
                    return 'Last week';
                else if (weeksAgo == 1)
                    return '1 week ago';
                return `${weeksAgo} weeks ago`
            }
            case 'Month': return moment(value).format('MMMM');
            default: return moment(value).format('MMMM D YY');
        }
    }
}

export class PercentageValueConverter {
    toView(value) {
        return `${Math.floor(value * 100)}%`;
    }
}

interface FacesGroup {
    startDate: Date;
    faces: Face[];
}

interface Face {
    url: string;
    originalImage: string;
    score: number;
    date: Date;
}

