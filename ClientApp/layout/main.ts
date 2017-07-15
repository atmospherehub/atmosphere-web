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
            route: 'super-stars',
            name: 'super-stars',
            settings: { icon: 'star-o' },
            moduleId: PLATFORM.moduleName('../views/super-stars'),
            nav: true,
            title: 'Super Stars'
        },
        {
            route: 'calendar',
            name: 'calendar',
            settings: { icon: 'calendar' },
            moduleId: PLATFORM.moduleName('../views/calendar'),
            nav: true,
            title: 'Calendar'
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
