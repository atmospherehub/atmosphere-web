import { autoinject } from 'aurelia-framework';
import * as moment from 'moment';
import { RestApi } from './../services/rest-api';
import { DialogService } from 'aurelia-dialog';
import { ModalImage, ImageModel } from '../components/modal-image/modal-image';

@autoinject()
export class Photos {
    private _api: RestApi;
    private _dialogService: DialogService;
    private _isLoading: boolean;
    private _currentDate: moment.Moment;
    private _date: Face[];

    constructor(api: RestApi, dialogService: DialogService) {
        this._currentDate = moment();
        this._api = api;
        this._dialogService = dialogService;
    }

    activate(routeParams, routeConfig) {
        if (!routeParams.date) {
            // no params in route => fall to defaults
            return;
        }

        let currentDate = moment(routeParams.date);
        if (!currentDate.isValid) {
            // don't deal with non valid input from route
            return;
        }

        this._currentDate = currentDate;
        routeConfig.navModel.title = `Photos of ${currentDate.format('MMM D YYYY')}`;
    }

    attached(): void {
        this._isLoading = true;

        this._api.get<Face[]>(`calendar/day/${this._currentDate.toISOString()}`)
            .then(data => {
                this._date = data;
                this._isLoading = false;
            });
    }

    private showImage(face: Face): void {
        this._dialogService.open({
            viewModel: ModalImage,
            model: {
                imageUrl: face.url,
                downloadImageUrl: face.originalImage,
                text: `${moment(face.date).format('MMMM DD HH:mm')}`
            },
            lock: false
        });
    }
}

interface Face {
    url: string;
    originalImage: string;
    Anger: number;
    Contempt: number;
    Disgust: number;
    Fear: number;
    Happiness: number;
    Neutral: number;
    Sadness: number;
    Surprise: number;
    date: Date;
}