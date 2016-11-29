(function () {
    'use strict';

    angular.module('Core')
        .controller('mapCtrl', mapCtrl)

    mapCtrl.$inject = [
        '$scope',
        '$timeout',
        'opentok'
    ];

    function mapCtrl($scope, $timeout, opentok) {

        $scope.$on('$viewContentLoaded', function () {
            $timeout(function () {
                initialize();
            })
        })


        function initialize() {
            console.log("initialize");
        }

        function initializeOpentokObjects() {
            console.log("initializeOpentokObjects");

            $scope.chat = {
                currentMsg: '',
                chatHistory: []
            };

            $scope.opentokConnection = {
                active: false,
                type: null
            };
        }

        $scope.openTOKCall = function (type) {
            initializeOpentokObjects();
            
            var OTInfo = {
                sessionId: "1_MX40NTcxNjY1Mn5-MTQ4MDAwMDM3NTUwMX5GK2F5K3p3dDBJWU00eElFdkpHaFdBSzZ-fg",
                token: "T1==cGFydG5lcl9pZD00NTcxNjY1MiZzaWc9YTE1Y2E5YTcxZTQzN2U3NDgwNmUxMGZmNWQ2MTljMGZkYTAwMjFiYzpzZXNzaW9uX2lkPTFfTVg0ME5UY3hOalkxTW41LU1UUTRNREF3TURNM05UVXdNWDVHSzJGNUszcDNkREJKV1UwMGVFbEZka3BIYUZkQlN6Wi1mZyZjcmVhdGVfdGltZT0xNDgwMDAwMzg2Jm5vbmNlPTAuMjE5NTg2OTQ4NzE3NTQ0NTgmcm9sZT1wdWJsaXNoZXImZXhwaXJlX3RpbWU9MTQ4MjU5MjM4NQ=="
            };


            return opentok
                .startOpentokCall(type, 'foo', OTInfo)
                .then(function () {
                    $scope.opentokConnection = {
                        active: true,
                        type: callType
                    };
                });

        };
    }

})();