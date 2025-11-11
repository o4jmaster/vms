from jadi import component

from aj.plugins.core.api.sidebar import SidebarItemProvider


@component(SidebarItemProvider)
class ItemProvider(SidebarItemProvider):
    def __init__(self, context):
        pass

    def provide(self):
        return [
            {
               'attach': None,
               'id': 'category:grafana',
               'name': 'GRAFANA',
               'children': []
            },
            {
                # category:tools, category:sofware, category:system, category:other
                'attach': 'category:grafana',
                'name': 'Dashboard',
                # https://fontawesome.com/icons/
                'icon': 'dashboard',
                'url': '/view/grafana',
                'children': []
            }
        ]