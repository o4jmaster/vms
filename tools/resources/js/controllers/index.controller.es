angular.module('vms.tools').controller('VMSIndexController', function($scope, $http, pageTitle, gettext, notify) {
    pageTitle.set(gettext('VMS'));

    $scope.counter = 0;

    $scope.click = () => {
            $scope.counter += 1;
            notify.info('+1');
        };

    // Bind a test var with the template.
    $scope.my_title = gettext('VMS');
    
    // GET a result through Python API
    $http.get('/api/tools').then( (resp) => {
	    $scope.python_get = resp.data;
    });

    // POST a result through Python API
    $http.post('/api/tools', {my_var: 'my_plugin'}).then( (resp) => {
	    $scope.python_post = resp.data;
    });

});

