from jadi import component
from aj.api.http import get, post, url, HttpPlugin
from aj.api.endpoint import endpoint, EndpointError
from aj.auth import authorize
from aj.plugins import PluginProvider

# Configure your Grafana URL here
GRAFANA_URL = "http://192.168.33.10:3000"

@component(HttpPlugin)
class Handler(HttpPlugin):
    @url(r'/view/grafana/?')
    @authorize('grafana:view')
    def handle_view(self, http_context):
        """
        Main view handler for Grafana page
        """
        return http_context.respond_ok()
    
    @get(r'/api/grafana/url')
    @endpoint(api=True)
    def handle_api_get_url(self, http_context):
        """
        Returns the Grafana URL to the frontend
        """
        return {
            'url': GRAFANA_URL
        }
