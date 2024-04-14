angular.module('vms.vmsrouting').controller('VMSRoutingIndexController', function($scope, $http, pageTitle, gettext, notify,messagebox) {
    pageTitle.set(gettext('Outbound Routing'));

    $scope.showDetailsOR = false;
    $scope.add_newOR = false;

    $http.get('/api/outroutes').then( (resp) => {
	    $scope.outroutes = resp.data.outroutes;
    });

    $http.get('/api/siptrunks').then( (resp) => {
	    $scope.siptrunks = resp.data.siptrunks;
    });



    $scope.addOR = () => {
        $scope.add_newOR = true;
        $scope.showDetailsOR = true;
        $scope.edit_outroute = {"trunkPrefix": "", "useFailover": false};
    };

    $scope.editOR = (outroute) => {
        $scope.edit_outroute = outroute;
        $scope.showDetailsOR = true;
    }

    $scope.resetOR = () => {
        $scope.showDetailsOR = false;
        $scope.add_newOR = false;
    }

    $scope.deleteOR = () => {
        $scope.showDetailsOR = false;
        $http.put('/api/outroutes', {config: $scope.outroutes}).then( (resp) => {
            $scope.outroutes = resp.data.outroutes;
            notify.success(gettext('Outbound Route successfully removed!'))
        });
    }

    $scope.saveOR = () => {
        $scope.showDetailsOR = false;
        $http.post('/api/outroutes', {config: $scope.outroutes}).then( (resp) => {
            $scope.outroutes = resp.data.outroutes;
            notify.success(gettext('Outbound route successfully saved!'))
        });
    }

    $scope.saveNewOR = () => {
        $scope.resetOR()
        $scope.outroutes.push($scope.edit_outroute);
        $scope.saveOR();
    }

    $scope.removeOR = (outroute) => {
        messagebox.show({
            text: gettext('Do you really want to permanently delete this outbound route?'),
            positive: gettext('Delete'),
            negative: gettext('Cancel')
        }).then( () => {
            position = $scope.outroutes.indexOf(outroute);
            $scope.outroutes.splice(position, 1);
            $scope.deleteOR();
        })
    }

    

});

