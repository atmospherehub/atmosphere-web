import { Aurelia, PLATFORM, autoinject } from 'aurelia-framework';
import { Router, RouterConfiguration } from 'aurelia-router';
import { AuthService } from '../services/auth';

@autoinject()
export class Main {
    public router: Router;
    public showMobileNav: boolean = false;
    private _authService: AuthService;

    constructor(authService: AuthService) {
        this._authService = authService;
    }

    configureRouter(config: RouterConfiguration, router: Router) {
        config.title = 'Atmosphere';
        config.map([{
            route: ['', 'dashboard'],
            name: 'dashboard',
            settings: { icon: 'bar-chart' },
            moduleId: PLATFORM.moduleName('../views/dashboard'),
            nav: true,
            title: 'Dashboard'
        },
        {
            route: 'highlights',
            name: 'highlights',
            settings: { icon: 'line-chart' },
            moduleId: PLATFORM.moduleName('../views/highlights'),
            nav: true,
            title: 'Highlights'
        }]);

        this.router = router;
    }

    public toggleMobileNav(): void {
        this.showMobileNav = !this.showMobileNav;
    }

    public signOut(): void {
        this._authService.signOut();
    }
}
