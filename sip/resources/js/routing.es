angular.module('vms.sip').config(($routeProvider) => {
    $routeProvider.when('/view/sip', {
        templateUrl: '/sip:resources/partial/index.html',
        controller: 'VMSIndexController',
    });
});
