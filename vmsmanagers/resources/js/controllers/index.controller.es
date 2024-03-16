angular.module('vms.vmsmanagers').controller('VMSManagersPluginIndexController', function($scope, $http, pageTitle, gettext, notify,messagebox) {
    pageTitle.set(gettext('Manager Users'));

    $scope.showDetails = false;
    $scope.add_new = false;

    $http.get('/api/managerusers').then( (resp) => {
	    $scope.managerusers = resp.data.managerusers;
    });

    $scope.add = () => {
        $scope.add_new = true;
        $scope.showDetails = true;
        $scope.edit_manageruser = {"amiWriteTimeout": 1000, "agiport": 4573}
    };

    $scope.edit = (manageruser) => {
        $scope.edit_manageruser = manageruser;
        $scope.showDetails = true;
    }

    $scope.reset = () => {
        $scope.showDetails = false;
        $scope.add_new = false;
    }

    $scope.delete = () => {
        $scope.showDetails = false;
        $http.put('/api/managerusers', {config: $scope.managerusers}).then( (resp) => {
            $scope.managerusers = resp.data.managerusers;
            notify.success(gettext('manageruser successfully removed!'))
        });
    }

    $scope.save = () => {
        $scope.showDetails = false;
        $http.post('/api/managerusers', {config: $scope.managerusers}).then( (resp) => {
            $scope.managerusers = resp.data.managerusers;
            notify.success(gettext('manageruser successfully saved!'))
        });
    }

    $scope.saveNew = () => {
        $scope.reset()
        $scope.managerusers.push($scope.edit_manageruser);
        $scope.save();
    }

    $scope.remove = (manageruser) => {
        messagebox.show({
            text: gettext('Do you really want to permanently delete this manageruser?'),
            positive: gettext('Delete'),
            negative: gettext('Cancel')
        }).then( () => {
            position = $scope.managerusers.indexOf(manageruser);
            $scope.managerusers.splice(position, 1);
            $scope.delete();
        })
    }



    
});

