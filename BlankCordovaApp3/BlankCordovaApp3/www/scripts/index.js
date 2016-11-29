(function () {
    'use strict';

    angular.module('Core', [
        'ngTouch',
        'ui.bootstrap',
        'ui.router'
    ])
    .config(function ($stateProvider, $urlRouterProvider, $httpProvider, $compileProvider) {
        if ('addEventListener' in document) {
            document.addEventListener('DOMContentLoaded', function () {
                FastClick.attach(document.body);
            }, false);
        }
        $urlRouterProvider.otherwise('/map');
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(|local)/);
    })

})();

