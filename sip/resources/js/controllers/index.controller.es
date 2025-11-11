angular.module('vms.sip').controller('SIPIndexController', function($scope, $http, pageTitle, gettext, notify, messagebox) {
    pageTitle.set(gettext('SIP'));

   $scope.showDetails = false;
    $scope.add_new = false;

    $http.get('/api/siptrunks').then( (resp) => {
	    $scope.siptrunks = resp.data.siptrunks;
    });

    $scope.add = () => {
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

    $scope.edit = (siptrunk) => {
        // Set defaults for new fields if they don't exist
        if (siptrunk.rtp_symmetric === undefined) siptrunk.rtp_symmetric = true;
        if (siptrunk.force_rport === undefined) siptrunk.force_rport = true;
        if (siptrunk.rewrite_contact === undefined) siptrunk.rewrite_contact = true;
        if (siptrunk.direct_media === undefined) siptrunk.direct_media = true;
        
        $scope.edit_siptrunk = siptrunk;
        $scope.showDetails = true;
    }

    $scope.reset = () => {
        $scope.showDetails = false;
        $scope.add_new = false;
    }

    $scope.delete = () => {
        $scope.showDetails = false;
        $http.put('/api/siptrunks', {config: $scope.siptrunks}).then( (resp) => {
            $scope.siptrunks = resp.data.siptrunks;
            notify.success(gettext('Siptrunk successfully removed!'))
        });
    }

    $scope.save = () => {
        $scope.showDetails = false;
        $http.post('/api/siptrunks', {config: $scope.siptrunks}).then( (resp) => {
            $scope.siptrunks = resp.data.siptrunks;
            notify.success(gettext('Siptrunk successfully saved!'))
        });
    }

    $scope.saveNew = () => {
        $scope.reset()
        $scope.siptrunks.push($scope.edit_siptrunk);
        $scope.save();
    }

    $scope.remove = (siptrunk) => {
        messagebox.show({
            text: gettext('Do you really want to permanently delete this siptrunk?'),
            positive: gettext('Delete'),
            negative: gettext('Cancel')
        }).then( () => {
            position = $scope.siptrunks.indexOf(siptrunk);
            $scope.siptrunks.splice(position, 1);
            $scope.delete();
        })
    }


});
