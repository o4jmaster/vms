angular.module('vms.inroutes').controller('InboundRoutingIndexController', function($scope, $http, pageTitle, gettext, notify,messagebox) {
    pageTitle.set(gettext('Inbound Routing'));

    $scope.add_new = false;
    $scope.showDetailsIR = false;

    $http.get('/api/inroutes').then( (resp) => {
	    $scope.inroutes = resp.data.inroutes;
    });

    $http.get('/api/getdesttrunks').then( (resp) => {
	    $scope.trunks = resp.data.trunks;
    });

    $scope.addIR = () => {
        $scope.add_new = true;
        $scope.showDetailsIR = true;
        $scope.edit_inroute = {};
    };

    $scope.editIR = (inroute) => {
        $scope.edit_inroute = inroute;
        $scope.showDetailsIR = true;
    }

    $scope.resetIR = () => {
        $scope.showDetailsIR = false;
        $scope.add_new = false;
    }

    $scope.deleteIR = () => {
        $scope.showDetailsIR = false;
        $http.put('/api/inroutes', {config: $scope.inroutes}).then( (resp) => {
            $scope.inroutes = resp.data.inroutes;
            notify.success(gettext('Inbound Route successfully removed!'))
        });
    }

    $scope.saveIR = () => {
        $scope.showDetailsIR = false;
        $http.post('/api/inroutes', {config: $scope.inroutes}).then( (resp) => {
            $scope.inroutes = resp.data.inroutes;
            notify.success(gettext('Inbound route successfully saved!'))
        });
    }

    $scope.saveNewIR = () => {
        $scope.resetIR()
        $scope.inroutes.push($scope.edit_inroute);
        $scope.saveIR();
    }

    $scope.removeIR = (inroute) => {
        messagebox.show({
            text: gettext('Do you really want to permanently delete this inbound route?'),
            positive: gettext('Delete'),
            negative: gettext('Cancel')
        }).then( () => {
            position = $scope.inroutes.indexOf(inroute);
            $scope.inroutes.splice(position, 1);
            $scope.deleteIR();
        })
    }


    
});

