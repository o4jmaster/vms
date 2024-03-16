angular.module('vms.vmsrouting').config(($routeProvider) => {
    $routeProvider.when('/view/vmsrouting', {
        templateUrl: '/vmsrouting:resources/partial/index.html',
        controller: 'VMSRoutingIndexController',
    });
});
