from jadi import component

from aj.api.http import url, HttpPlugin
from aj.auth import authorize
from aj.api.endpoint import endpoint, EndpointError

from aj.plugins.conference.orm import ORMmanager
from bson.json_util import dumps, loads
import json
import logging
from bson.objectid import ObjectId


@component(HttpPlugin)
class Handler(HttpPlugin):
    def __init__(self, context):
        self.context = context
        self.orm = ORMmanager(context)
    
    @url(r'/api/outroutes')
    @endpoint(api=True)
    def handle_api_out_routes(self, http_context):

        if http_context.method == 'GET':
            return(self.getOutRoutes())
            #return {"outroutes": [{"routeName": "Conf 6001", "routePrefix": "6001", "id": "65e5e4c29f9cce84d57fc70d"}, {"routeName": "Conf 6002", "routePrefix": "6002", "id": "65e5e4ca9f9cce84d57fc70e"}]}

        if http_context.method == 'PUT':
            print(f"delete: {http_context.json_body()['config']}")
            outroutes = http_context.json_body()['config']
            for u in self.getOutRoutes()['outroutes']:
                print(f"u obj: {u}")
                if u in outroutes:
                    continue
                else: 
                    print(f"delete: {u}")
                    self.orm.outroutes.delete_one({"_id": ObjectId(u['id'])})
            return(self.getOutRoutes())

        if http_context.method == 'POST':
            outroutes = http_context.json_body()['config']
            print(http_context.json_body())
            print(outroutes)
            for route in outroutes:
                if self.orm.outroutes.find_one({"routeName": route['routeName']}) is None:
                    self.orm.outroutes.insert_one(route)
                else:
                    logging.info(f"document exists {route}")
                    updated = self.orm.outroutes.update_one({"_id": ObjectId(route['id'])},{"$set": route})
            return (self.getOutRoutes())
    
    def getOutRoutes(self):
        cols = []
        for route in self.orm.outroutes.find({}):
            route["id"] = str(route['_id'])
            del route['_id']
            cols.append(route)

        return {"outroutes": [route for route in cols ]}