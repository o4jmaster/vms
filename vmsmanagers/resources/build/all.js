'use strict';

// the module should depend on 'core' to use the stock services & components
angular.module('vms.vmsmanagers', ['core']);


'use strict';

angular.module('vms.vmsmanagers').config(function ($routeProvider) {
    $routeProvider.when('/view/vmsmanagers', {
        templateUrl: '/vmsmanagers:resources/partial/index.html',
        controller: 'VMSManagersPluginIndexController'
    });
});


'use strict';

angular.module('vms.vmsmanagers').controller('VMSManagersPluginIndexController', function ($scope, $http, pageTitle, gettext, notify, messagebox) {
    pageTitle.set(gettext('Manager Users'));

    $scope.showDetails = false;
    $scope.add_new = false;

    $http.get('/api/managerusers').then(function (resp) {
        $scope.managerusers = resp.data.managerusers;
    });

    $scope.add = function () {
        $scope.add_new = true;
        $scope.showDetails = true;
        $scope.edit_manageruser = { "amiWriteTimeout": 1000, "agiport": 4573 };
    };

    $scope.edit = function (manageruser) {
        $scope.edit_manageruser = manageruser;
        $scope.showDetails = true;
    };

    $scope.reset = function () {
        $scope.showDetails = false;
        $scope.add_new = false;
    };

    $scope.delete = function () {
        $scope.showDetails = false;
        $http.put('/api/managerusers', { config: $scope.managerusers }).then(function (resp) {
            $scope.managerusers = resp.data.managerusers;
            notify.success(gettext('manageruser successfully removed!'));
        });
    };

    $scope.save = function () {
        $scope.showDetails = false;
        $http.post('/api/managerusers', { config: $scope.managerusers }).then(function (resp) {
            $scope.managerusers = resp.data.managerusers;
            notify.success(gettext('manageruser successfully saved!'));
        });
    };

    $scope.saveNew = function () {
        $scope.reset();
        $scope.managerusers.push($scope.edit_manageruser);
        $scope.save();
    };

    $scope.remove = function (manageruser) {
        messagebox.show({
            text: gettext('Do you really want to permanently delete this manageruser?'),
            positive: gettext('Delete'),
            negative: gettext('Cancel')
        }).then(function () {
            position = $scope.managerusers.indexOf(manageruser);
            $scope.managerusers.splice(position, 1);
            $scope.delete();
        });
    };
});


