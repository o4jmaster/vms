angular.module('vms.vmsmanagers').config(($routeProvider) => {
    $routeProvider.when('/view/vmsmanagers', {
        templateUrl: '/vmsmanagers:resources/partial/index.html',
        controller: 'VMSManagersPluginIndexController',
    });
});
