import { inject, bindable } from 'aurelia-framework';
import * as $ from 'jquery'
import { Router } from 'aurelia-router';
import { AuthService } from '../../services/auth';

@inject(Element, AuthService)
export class MobileCustomElement {
    private _element: any;
    @bindable public showMobileNav: boolean;
    @bindable public router: Router;
    private _authService: AuthService;

    constructor(element: Element, authService: AuthService) {
        this._element = $(element);
        this._authService = authService;
    }

    public showMobileNavChanged(newValue, oldValue): void {
        if (this.showMobileNav == true) {
            $('<div id="bodyClick"></div>').appendTo("body").click(function () {
                $('body').removeClass('nav-open');
                $('#bodyClick').remove();
            });
            $('body').addClass('nav-open');
        }
    }

    public signOut(): void {
        this._authService.signOut();
    }
}
