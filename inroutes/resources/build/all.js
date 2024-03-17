'use strict';

// the module should depend on 'core' to use the stock services & components
angular.module('vms.inroutes', ['core']);


'use strict';

angular.module('vms.inroutes').config(function ($routeProvider) {
    $routeProvider.when('/view/inroutes', {
        templateUrl: '/inroutes:resources/partial/index.html',
        controller: 'InboundRoutingIndexController'
    });
});


'use strict';

angular.module('vms.inroutes').controller('InboundRoutingIndexController', function ($scope, $http, pageTitle, gettext, notify, messagebox) {
    pageTitle.set(gettext('Inbound Routing'));

    $scope.add_new = false;
    $scope.showDetailsIR = false;

    $http.get('/api/inroutes').then(function (resp) {
        $scope.inroutes = resp.data.inroutes;
    });

    $http.get('/api/getdesttrunks').then(function (resp) {
        $scope.trunks = resp.data.trunks;
    });

    $scope.addIR = function () {
        $scope.add_new = true;
        $scope.showDetailsIR = true;
        $scope.edit_inroute = {};
    };

    $scope.editIR = function (inroute) {
        $scope.edit_inroute = inroute;
        $scope.showDetailsIR = true;
    };

    $scope.resetIR = function () {
        $scope.showDetailsIR = false;
        $scope.add_new = false;
    };

    $scope.deleteIR = function () {
        $scope.showDetailsIR = false;
        $http.put('/api/inroutes', { config: $scope.inroutes }).then(function (resp) {
            $scope.inroutes = resp.data.inroutes;
            notify.success(gettext('Inbound Route successfully removed!'));
        });
    };

    $scope.saveIR = function () {
        $scope.showDetailsIR = false;
        $http.post('/api/inroutes', { config: $scope.inroutes }).then(function (resp) {
            $scope.inroutes = resp.data.inroutes;
            notify.success(gettext('Inbound route successfully saved!'));
        });
    };

    $scope.saveNewIR = function () {
        $scope.resetIR();
        $scope.inroutes.push($scope.edit_inroute);
        $scope.saveIR();
    };

    $scope.removeIR = function (inroute) {
        messagebox.show({
            text: gettext('Do you really want to permanently delete this inbound route?'),
            positive: gettext('Delete'),
            negative: gettext('Cancel')
        }).then(function () {
            position = $scope.inroutes.indexOf(inroute);
            $scope.inroutes.splice(position, 1);
            $scope.deleteIR();
        });
    };
});


