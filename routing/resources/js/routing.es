angular.module('vms.routing').config(($routeProvider) => {
    $routeProvider.when('/view/routing', {
        templateUrl: '/routing:resources/partial/index.html',
        controller: 'VMSIndexController',
    });
});
