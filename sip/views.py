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
    

    @url(r'/api/siptrunks')
    @endpoint(api=True)
    def handle_api_in_siptrunks(self, http_context):

        if http_context.method == 'GET':
            return(self.getSipTrunks())
            #return {"siptrunks": [{"routeName": "Conf 6001", "routeNumber": "6001", "id": "65e5e4c29f9cce84d57fc70d"}, {"routeName": "Conf 6002", "routeNumber": "6002", "id": "65e5e4ca9f9cce84d57fc70e"}]}


        if http_context.method == 'PUT':
            print(f"delete: {http_context.json_body()['config']}")
            siptrunks = http_context.json_body()['config']
            for u in self.getSipTrunks()['siptrunks']:
                print(f"u obj: {u}")
                if u in siptrunks:
                    continue
                else: 
                    print(f"delete: {u}")
                    self.orm.sipusers.delete_one({"_id": ObjectId(u['id'])})
            return(self.getSipTrunks())

        if http_context.method == 'POST':
            siptrunks = http_context.json_body()['config']
            print(siptrunks)
            for siptrunk in siptrunks:
                if self.orm.sipusers.find_one({"name": siptrunk['name']}) is None:
                    siptrunk['type'] = 'peer'
                    self.orm.sipusers.insert_one(siptrunk)
                else:
                    logging.info(f"document exists {siptrunk}")
                    updated = self.orm.sipusers.update_one({"_id": ObjectId(siptrunk['id'])},{"$set": siptrunk})
            return (self.getSipTrunks())
   
    
    def getSipTrunks(self):
        cols = []
        for siptrunk in self.orm.sipusers.find({"type": "peer"}):
            siptrunk["id"] = str(siptrunk['_id'])
            del siptrunk['_id']
            cols.append(siptrunk)

        return {"siptrunks": [siptrunk for siptrunk in cols ]}