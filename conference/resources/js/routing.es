angular.module('vms.conference').config(($routeProvider) => {
    $routeProvider.when('/view/conference', {
        templateUrl: '/conference:resources/partial/index.html',
        controller: 'ConferenceIndexController',
    });
});
