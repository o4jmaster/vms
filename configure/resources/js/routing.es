angular.module('vms.configure').config(($routeProvider) => {
    $routeProvider.when('/view/configure', {
        templateUrl: '/configure:resources/partial/index.html',
        controller: 'VMSIndexController',
    });
});
