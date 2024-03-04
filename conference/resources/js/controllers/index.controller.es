angular.module('vms.conference').controller('VMSIndexController', function($scope, $http, pageTitle, gettext, notify, messagebox) {
    pageTitle.set(gettext('Conferences'));
    
    $scope.showDetails = false;
    $scope.add_new = false;

    $http.get('/api/confs').then( (resp) => {
	    $scope.confs = resp.data.confs;
    });

    $scope.edit = (conf) => {
        $scope.edit_conf = conf;
        $scope.showDetails = true;
    }

    $scope.reset = () => {
        $scope.showDetails = false;
        $scope.add_new = false;
    }

    $scope.delete = () => {
        $scope.showDetails = false;
        $http.put('/api/confs', {config: $scope.confs}).then( (resp) => {
            $scope.confs = resp.data.confs;
            notify.success(gettext('Conferences successfully saved!'))
        });
    }

    $scope.save = () => {
        $scope.showDetails = false;
        $http.post('/api/confs', {config: $scope.confs}).then( (resp) => {
            $scope.confs = resp.data.confs;
            notify.success(gettext('Conferences successfully saved!'))
        });
    }

     $scope.saveNew = () => {
        $scope.reset()
        $scope.confs.push($scope.edit_conf);
        $scope.save();
    }

    $scope.remove = (conf) => {
        messagebox.show({
            text: gettext('Do you really want to permanently delete this conference?'),
            positive: gettext('Delete'),
            negative: gettext('Cancel')
        }).then( () => {
            position = $scope.confs.indexOf(conf);
            $scope.confs.splice(position, 1);
            $scope.delete();
        })
    }



   
    
    $scope.add = () => {
        $scope.add_new = true;
        $scope.showDetails = true;
    };

    // Bind a test var with the template.
    $scope.my_title = gettext('VMS');
    
    // GET a result through Python API
    $http.get('/api/conference').then( (resp) => {
	    $scope.python_get = resp.data;
    });

    // POST a result through Python API
    $http.post('/api/conference', {my_var: 'my_plugin'}).then( (resp) => {
	    $scope.python_post = resp.data;
    });

});

