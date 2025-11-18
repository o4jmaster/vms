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
        // Validate Name
        if (!$scope.edit_manageruser.name || $scope.edit_manageruser.name.trim() === '') {
            notify.error(gettext('Name is required!'));
            return;
        }
        
        // Validate Host IP
        if (!$scope.edit_manageruser.hostip || $scope.edit_manageruser.hostip.trim() === '') {
            notify.error(gettext('Host IP is required!'));
            return;
        }
        
        // Validate Password
        if (!$scope.edit_manageruser.password || $scope.edit_manageruser.password.trim() === '') {
            notify.error(gettext('Password is required!'));
            return;
        }
        
        // Validate AGI Prefix
        if ($scope.edit_manageruser.agiprefix === undefined || $scope.edit_manageruser.agiprefix === null || $scope.edit_manageruser.agiprefix === '') {
            notify.error(gettext('AGI Prefix is required!'));
            return;
        }
        
        // Validate Conf Prefix
        if ($scope.edit_manageruser.confprefix === undefined || $scope.edit_manageruser.confprefix === null || $scope.edit_manageruser.confprefix === '') {
            notify.error(gettext('Conf Prefix is required!'));
            return;
        }
        
        // Validate AMD Prefix
        if ($scope.edit_manageruser.amdprefix === undefined || $scope.edit_manageruser.amdprefix === null || $scope.edit_manageruser.amdprefix === '') {
            notify.error(gettext('AMD Prefix is required!'));
            return;
        }
        
        $scope.showDetails = false;
        $http.post('/api/managerusers', {config: $scope.managerusers}).then( (resp) => {
            $scope.managerusers = resp.data.managerusers;
            notify.success(gettext('manageruser successfully saved!'))
        });
    }

    $scope.saveNew = () => {
        // Validate Name
        if (!$scope.edit_manageruser.name || $scope.edit_manageruser.name.trim() === '') {
            notify.error(gettext('Name is required!'));
            return;
        }
        
        // Validate Host IP
        if (!$scope.edit_manageruser.hostip || $scope.edit_manageruser.hostip.trim() === '') {
            notify.error(gettext('Host IP is required!'));
            return;
        }
        
        // Validate Password
        if (!$scope.edit_manageruser.password || $scope.edit_manageruser.password.trim() === '') {
            notify.error(gettext('Password is required!'));
            return;
        }
        
        // Validate AGI Prefix
        if ($scope.edit_manageruser.agiprefix === undefined || $scope.edit_manageruser.agiprefix === null || $scope.edit_manageruser.agiprefix === '') {
            notify.error(gettext('AGI Prefix is required!'));
            return;
        }
        
        // Validate Conf Prefix
        if ($scope.edit_manageruser.confprefix === undefined || $scope.edit_manageruser.confprefix === null || $scope.edit_manageruser.confprefix === '') {
            notify.error(gettext('Conf Prefix is required!'));
            return;
        }
        
        // Validate AMD Prefix
        if ($scope.edit_manageruser.amdprefix === undefined || $scope.edit_manageruser.amdprefix === null || $scope.edit_manageruser.amdprefix === '') {
            notify.error(gettext('AMD Prefix is required!'));
            return;
        }
        
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

