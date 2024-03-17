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

    $scope.addOR = function () {
        $scope.add_newOR = true;
        $scope.showDetailsOR = true;
        $scope.edit_outroute = {};
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
            notify.success(gettext('Outbound route successfully saved!'));
        });
    };

    $scope.saveNewOR = function () {
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


