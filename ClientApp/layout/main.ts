import { Aurelia, PLATFORM, inject } from 'aurelia-framework';
import { Router, RouterConfiguration } from 'aurelia-router';
import { AuthService } from "../services/auth";

@inject(AuthService)
export class Main {
    public router: Router;
    private _authService: AuthService;

    constructor(authService: AuthService) {
        this._authService = authService;
    }

    configureRouter(config: RouterConfiguration, router: Router) {
        config.title = 'Atmosphere';
        config.map([{
            route: ['', 'dashboard'],
            name: 'dashboard',
            settings: { icon: 'home' },
            moduleId: PLATFORM.moduleName('../views/dashboard'),
            nav: true,
            title: 'Dashboard'
        }]);

        this.router = router;
    }

    public signOut(): void {
        this._authService.signOut();
    }
}
