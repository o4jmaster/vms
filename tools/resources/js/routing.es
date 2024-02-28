angular.module('vms.tools').config(($routeProvider) => {
    $routeProvider.when('/view/tools', {
        templateUrl: '/tools:resources/partial/index.html',
        controller: 'VMSIndexController',
    });
});
