'use strict';

// the module should depend on 'core' to use the stock services & components
angular.module('vms.sip', ['core']);


'use strict';

angular.module('vms.sip').config(function ($routeProvider) {
    $routeProvider.when('/view/sip', {
        templateUrl: '/sip:resources/partial/index.html',
        controller: 'SIPIndexController'
    });
});


'use strict';

angular.module('vms.sip').controller('SIPIndexController', function ($scope, $http, pageTitle, gettext, notify, messagebox) {
    pageTitle.set(gettext('SIP'));

    $scope.showDetails = false;
    $scope.add_new = false;

    $http.get('/api/siptrunks').then(function (resp) {
        $scope.siptrunks = resp.data.siptrunks;
    });

    $scope.add = function () {
        $scope.add_new = true;
        $scope.showDetails = true;
        $scope.edit_siptrunk = {
            "transport": "transport-udp",
            "dtmfmode": "rfc4733",
            "port": 5060,
            "rtp_symmetric": true,
            "force_rport": true,
            "rewrite_contact": true,
            "direct_media": true
        };
    };

    $scope.edit = function (siptrunk) {
        // Set defaults for new fields if they don't exist
        if (siptrunk.rtp_symmetric === undefined) siptrunk.rtp_symmetric = true;
        if (siptrunk.force_rport === undefined) siptrunk.force_rport = true;
        if (siptrunk.rewrite_contact === undefined) siptrunk.rewrite_contact = true;
        if (siptrunk.direct_media === undefined) siptrunk.direct_media = true;

        $scope.edit_siptrunk = siptrunk;
        $scope.showDetails = true;
    };

    $scope.reset = function () {
        $scope.showDetails = false;
        $scope.add_new = false;
    };

    $scope.delete = function () {
        $scope.showDetails = false;
        $http.put('/api/siptrunks', { config: $scope.siptrunks }).then(function (resp) {
            $scope.siptrunks = resp.data.siptrunks;
            notify.success(gettext('Siptrunk successfully removed!'));
        });
    };

    $scope.save = function () {
        $scope.showDetails = false;
        $http.post('/api/siptrunks', { config: $scope.siptrunks }).then(function (resp) {
            $scope.siptrunks = resp.data.siptrunks;
            notify.success(gettext('Siptrunk successfully saved!'));
        });
    };

    $scope.saveNew = function () {
        $scope.reset();
        $scope.siptrunks.push($scope.edit_siptrunk);
        $scope.save();
    };

    $scope.remove = function (siptrunk) {
        messagebox.show({
            text: gettext('Do you really want to permanently delete this siptrunk?'),
            positive: gettext('Delete'),
            negative: gettext('Cancel')
        }).then(function () {
            position = $scope.siptrunks.indexOf(siptrunk);
            $scope.siptrunks.splice(position, 1);
            $scope.delete();
        });
    };
});


