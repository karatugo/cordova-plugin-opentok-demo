(function () {
    'use strict';

    angular.module('Core')
           .config(configureRouter);

    function configureRouter($stateProvider) {
        $stateProvider
            .state('map', {
                url: '/map',
                templateUrl: 'scripts/map.html',
                controller: 'mapCtrl'
            });
    }
})();