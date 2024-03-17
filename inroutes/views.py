from jadi import component

from aj.api.http import url, HttpPlugin
from aj.auth import authorize
from aj.api.endpoint import endpoint, EndpointError

from aj.plugins.conference.orm import ORMmanager
from aj.plugins.conference.astconfig import GlobalsManager
from bson.json_util import dumps, loads
import json
import logging
from bson.objectid import ObjectId


@component(HttpPlugin)
class Handler(HttpPlugin):
    def __init__(self, context):
        self.context = context
        self.orm = ORMmanager(context)
        self.globals = GlobalsManager(context)
    

    @url(r'/api/inroutes')
    @endpoint(api=True)
    def handle_api_in_routes(self, http_context):

        if http_context.method == 'GET':
            return(self.getInRoutes())
            #return {"inroutes": [{"routeName": "Conf 6001", "routeNumber": "6001", "id": "65e5e4c29f9cce84d57fc70d"}, {"routeName": "Conf 6002", "routeNumber": "6002", "id": "65e5e4ca9f9cce84d57fc70e"}]}


        if http_context.method == 'PUT':
            print(f"delete: {http_context.json_body()['config']}")
            inroutes = http_context.json_body()['config']
            for u in self.getInRoutes()['inroutes']:
                print(f"u obj: {u}")
                if u in inroutes:
                    continue
                else: 
                    print(f"delete: {u}")
                    self.orm.inroutes.delete_one({"_id": ObjectId(u['id'])})
            self.globals.config.doUpdate()
            return(self.getInRoutes())

        if http_context.method == 'POST':
            inroutes = http_context.json_body()['config']
            print(inroutes)
            for route in inroutes:
                if self.orm.inroutes.find_one({"routeNumber": route['routeNumber']}) is None:
                    self.orm.inroutes.insert_one(route)
                else:
                    logging.info(f"document exists {route}")
                    updated = self.orm.inroutes.update_one({"_id": ObjectId(route['id'])},{"$set": route})
            self.globals.config.doUpdate()
            return (self.getInRoutes())
   
    
    def getInRoutes(self):
        cols = []
        for route in self.orm.inroutes.find({}):
            route["id"] = str(route['_id'])
            del route['_id']
            cols.append(route)

        return {"inroutes": [route for route in cols ]}
    
    @url(r'/api/getdesttrunks')
    @endpoint(api=True)
    def getdestTrunks(self,http_context):
        trunks = []
        trunks.append('echotest')
        trunks.append('audiofork')
        for siptrunk in self.orm.sipusers.find({"type": "peer"}):
            trunks.append(siptrunk['name'])
        return {"trunks": [trunk for trunk in trunks]}
