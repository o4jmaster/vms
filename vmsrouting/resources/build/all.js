'use strict';

// the module should depend on 'core' to use the stock services & components
angular.module('vms.vmsrouting', ['core']);


'use strict';

angular.module('vms.vmsrouting').config(function ($routeProvider) {
    $routeProvider.when('/view/vmsrouting', {
        templateUrl: '/vmsrouting:resources/partial/index.html',
        controller: 'VMSRoutingIndexController'
    });
});


'use strict';

angular.module('vms.vmsrouting').controller('VMSRoutingIndexController', function ($scope, $http, pageTitle, gettext, notify, messagebox) {
    pageTitle.set(gettext('Outbound Routing'));

    $scope.showDetailsOR = false;
    $scope.add_newOR = false;

    $http.get('/api/outroutes').then(function (resp) {
        $scope.outroutes = resp.data.outroutes;
    });

    $http.get('/api/siptrunks').then(function (resp) {
        $scope.siptrunks = resp.data.siptrunks;
    });

    $http.get('/api/outrouteNames').then(function (resp) {
        $scope.outrouteNames = resp.data;
    });

    $scope.addOR = function () {
        $scope.add_newOR = true;
        $scope.showDetailsOR = true;
        $scope.edit_outroute = { "trunkPrefix": "", "useFailover": false };
    };

    $scope.editOR = function (outroute) {
        $scope.edit_outroute = outroute;
        $scope.showDetailsOR = true;
    };

    $scope.resetOR = function () {
        $scope.showDetailsOR = false;
        $scope.add_newOR = false;
    };

    $scope.deleteOR = function () {
        $scope.showDetailsOR = false;
        $http.put('/api/outroutes', { config: $scope.outroutes }).then(function (resp) {
            $scope.outroutes = resp.data.outroutes;
            notify.success(gettext('Outbound Route successfully removed!'));
        });
    };

    $scope.saveOR = function () {
        $scope.showDetailsOR = false;
        $http.post('/api/outroutes', { config: $scope.outroutes }).then(function (resp) {
            $scope.outroutes = resp.data.outroutes;

            // Refresh the route names list after saving
            $http.get('/api/outrouteNames').then(function (resp) {
                $scope.outrouteNames = resp.data;
            });

            notify.success(gettext('Outbound route successfully saved!'));
        });
    };

    $scope.saveNewOR = function () {
        // FIXED: Changed from .name to .routeName
        if (!$scope.edit_outroute.routeName || $scope.edit_outroute.routeName.trim() === '') {
            notify.error(gettext('Route name is required!'));
            return;
        }

        // Check if route name already exists in outrouteNames array
        if ($scope.outrouteNames && $scope.outrouteNames.includes($scope.edit_outroute.routeName)) {
            notify.error(gettext('RouteName already Exists'));
            return;
        }

        // If validation passes, proceed with save
        $scope.resetOR();
        $scope.outroutes.push($scope.edit_outroute);
        $scope.saveOR();
    };

    $scope.removeOR = function (outroute) {
        messagebox.show({
            text: gettext('Do you really want to permanently delete this outbound route?'),
            positive: gettext('Delete'),
            negative: gettext('Cancel')
        }).then(function () {
            position = $scope.outroutes.indexOf(outroute);
            $scope.outroutes.splice(position, 1);
            $scope.deleteOR();
        });
    };
});


