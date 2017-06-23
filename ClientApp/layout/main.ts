import { Aurelia, PLATFORM } from 'aurelia-framework';
import { Router, RouterConfiguration } from 'aurelia-router';

export class Main {
    router: Router;

    configureRouter(config: RouterConfiguration, router: Router) {
        config.title = 'Atmosphere';
        config.map([{
            route: [ '', 'dashboard' ],
            name: 'dashboard',
            settings: { icon: 'home' },
            moduleId: PLATFORM.moduleName('../views/dashboard'),
            nav: true,
            title: 'Home'
        }, {
            route: 'fetch-data',
            name: 'fetchdata',
            settings: { icon: 'th-list' },
            moduleId: PLATFORM.moduleName('../views/fetchdata'),
            nav: true,
            title: 'Fetch data'
        }]);


        this.router = router;
    }
}
