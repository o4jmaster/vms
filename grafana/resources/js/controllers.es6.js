angular.module('ajenti.grafana', [
    'core',
]);

// Configure the Angular route for /view/grafana
angular.module('ajenti.grafana').config(function($routeProvider) {
    $routeProvider.when('/view/grafana', {
        templateUrl: '/resources/grafana/resources/partial/index.html',
        controller: 'GrafanaIndexController'
    });
});

angular.module('ajenti.grafana').controller('GrafanaIndexController', function($scope, $http, $sce, notify) {
    $scope.grafanaUrl = '';
    $scope.loading = true;
    $scope.error = false;

    // Fetch Grafana URL from backend
    $http.get('/api/grafana/url').then((response) => {
        // Use $sce to mark the URL as trusted for iframe src binding
        $scope.grafanaUrl = $sce.trustAsResourceUrl(response.data.url);
        $scope.loading = false;
    }).catch((error) => {
        notify.error('Failed to load Grafana URL');
        $scope.error = true;
        $scope.loading = false;
    });
});
