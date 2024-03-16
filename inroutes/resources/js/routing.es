angular.module('vms.inroutes').config(($routeProvider) => {
    $routeProvider.when('/view/inroutes', {
        templateUrl: '/inroutes:resources/partial/index.html',
        controller: 'InboundRoutingIndexController',
    });
});
