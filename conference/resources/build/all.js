'use strict';

// the module should depend on 'core' to use the stock services & components
angular.module('vms.conference', ['core']);


'use strict';

angular.module('vms.conference').config(function ($routeProvider) {
    $routeProvider.when('/view/conference', {
        templateUrl: '/conference:resources/partial/index.html',
        controller: 'ConferenceIndexController'
    });
});


'use strict';

angular.module('vms.conference').controller('ConferenceIndexController', function ($scope, $http, pageTitle, gettext, notify, messagebox) {
    pageTitle.set(gettext('Conferences'));

    $scope.showDetails = false;
    $scope.add_new = false;

    $http.get('/api/confs').then(function (resp) {
        $scope.confs = resp.data.confs;
    });

    $scope.add = function () {
        $scope.add_new = true;
        $scope.showDetails = true;
        $scope.edit_conf = {};
    };

    $scope.edit = function (conf) {
        $scope.edit_conf = conf;
        $scope.showDetails = true;
    };

    $scope.reset = function () {
        $scope.showDetails = false;
        $scope.add_new = false;
    };

    $scope.delete = function () {
        $scope.showDetails = false;
        $http.put('/api/confs', { config: $scope.confs }).then(function (resp) {
            $scope.confs = resp.data.confs;
            notify.success(gettext('Conferences successfully removed!'));
        });
    };

    $scope.save = function () {
        $scope.showDetails = false;
        $http.post('/api/confs', { config: $scope.confs }).then(function (resp) {
            $scope.confs = resp.data.confs;
            notify.success(gettext('Conferences successfully saved!'));
        });
    };

    $scope.saveNew = function () {
        $scope.reset();
        $scope.confs.push($scope.edit_conf);
        $scope.save();
    };

    $scope.remove = function (conf) {
        messagebox.show({
            text: gettext('Do you really want to permanently delete this conference?'),
            positive: gettext('Delete'),
            negative: gettext('Cancel')
        }).then(function () {
            position = $scope.confs.indexOf(conf);
            $scope.confs.splice(position, 1);
            $scope.delete();
        });
    };
});


