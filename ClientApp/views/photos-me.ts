import { autoinject } from 'aurelia-framework';
import * as moment from 'moment';
import { RestApi } from './../services/rest-api';
import { DialogService } from 'aurelia-dialog';
import { ModalImage, ImageModel } from '../components/modal-image/modal-image';
import { Router } from 'aurelia-router';
import * as _ from 'underscore'

@autoinject()
export class PhotosMe {
    private _api: RestApi;
    private _dialogService: DialogService;
    private _isLoading: boolean;
    private _data: Face[];
    private _name: string;

    constructor(api: RestApi, dialogService: DialogService, router: Router) {
        this._api = api;
        this._dialogService = dialogService;
    }

    activate(routeParams, routeConfig) {      
        this._isLoading = true;
        this._data = [];
        this._api.get<Face[]>(`/me/photos`)
            .then(data => {
                this._data = data;
                this._isLoading = false;
            });
    }

    private showImage(face: Face): void {
        let moodsFormated = _
            .chain(face.moods)
            .filter(m => m.score > 0.02)
            .sortBy(m => m.score)
            .map(m => `${m.name}: ${Math.floor(m.score * 100)}%`)
            .value()
            .join(' | ');
        var infoText: string;
        if (face.firstName)
            infoText = `${face.firstName} at ${moment(face.date).format('HH:mm')} | ${moodsFormated}`;
        else
            infoText = `Time: ${moment(face.date).format('HH:mm')} | ${moodsFormated}`;

        this._dialogService.open({
            viewModel: ModalImage,
            model: {
                imageUrl: face.url,
                downloadImageUrl: face.originalImage,
                text: infoText
            },
            lock: false
        });
    }
}

export class CalendarUrlValueConverter {
    toView(value: moment.Moment, router: Router) {
        return router.generate(`calendar`, { currentDate: value.format("YYYY-MM-DD") })
    }
}

export class PhotoInfoValueConverter {
    toView(face: Face) {
        let timestamp = moment(face.date).format("HH:mm");
        if (face.firstName)
            return `${face.firstName} at ${timestamp}`;
        else
            return timestamp;
    }
}

export class PhotoScoreValueConverter {
    toView(value: number) {
        return `${Math.floor(value * 100)}%`;
    }
}

export class FilterScoresValueConverter {
    toView(array: FaceMood[]) {
        return _.chain(array)
            .filter(m => m.score > 0.02)
            .sortBy(m => m.score)
            .first(4)
            .value();
    }
}

interface Face {
    url: string;
    originalImage: string;
    date: Date;
    moods: FaceMood[];
    firstName: string;
}

interface FaceMood {
    name: string;
    score: number;
}