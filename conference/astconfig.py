from jadi import service, component, interface, Context
from .orm import ORMmanager
import logging
import os

@interface
class IManager(object):
    def __init__(self, context):
        pass

@component(IManager)
class GlobalsManager(IManager): #This Class is responsible for manging global configurations include asterisk configs, reflecting old globals.py in ajenti1
    def __init__(self, context):
        self.context = context
        self.orm = ORMmanager.any(self.context)
        self.config = VMSConfig(self.orm)
       




class VMSConfig(object):
    
    def __init__(self,orm):
        self.orm = orm
        self.astcfg_dir = "/apps/crm/vms-package/etc/asterisk"
        logging.info("VMSConfig Init")

        
    #Allowing direct Asterisk-cli interactions
    def cli(self,command):
        return os.popen('/apps/crm/vms-package/sbin/asterisk -rx "' + command + '"').read()
    

    def doUpdate(self):
        extenconfig = '[divoiceint-vms]\n\n'
        mgrconfig = ""
        for mgr in self.orm.managerusers.find({}):
            if mgr['hostip'] is None or mgr['name'] is None: continue
            extenconfig = extenconfig + 'exten => _' + mgr['agiprefix'] + '.,1,Set(myexten=${EXTEN})\n'
            if 'fqdn' in mgr and mgr['fqdn'] is not None and len(mgr['fqdn']) > 3:
                extenconfig = extenconfig + 'exten => _' + mgr['agiprefix'] + '.,2,AGI(agi://'+ mgr['fqdn'] +'/GetCallInAction.agi:'+ str(mgr['agiport']) +')\n'
            else:
                extenconfig = extenconfig + 'exten => _' + mgr['agiprefix'] + '.,2,AGI(agi://'+ mgr['hostip'] +'/GetCallInAction.agi:'+ str(mgr['agiport']) +')\n'
            extenconfig = extenconfig + 'exten => _' + mgr['agiprefix'] + '.,3,Goto(vmsagi,${EXTEN},1)\n\n'
            
            extenconfig = extenconfig + 'exten => _' + mgr['amdprefix'] + '.,1,NoOp(amd detection ${amdSet} value) \n'
            extenconfig = extenconfig + 'exten => _' + mgr['amdprefix'] + '.,2,GotoIf($[\"${amdSet}" = \"true\"]?4:3)\n'
            extenconfig = extenconfig + 'exten => _' + mgr['amdprefix'] + '.,3,Goto(amd,${EXTEN},1)\n'
            if 'fqdn' in mgr and mgr['fqdn'] is not None and len(mgr['fqdn']) > 3:
                extenconfig = extenconfig + 'exten => _' + mgr['amdprefix'] + '.,4,AGI(agi://'+ mgr['fqdn'] +'/GetCallInAction.agi:'+ str(mgr['agiport']) +')\n'
            else:
                extenconfig = extenconfig + 'exten => _' + mgr['amdprefix'] + '.,4,AGI(agi://'+ mgr['hostip'] +'/GetCallInAction.agi:'+ str(mgr['agiport']) +')\n'
            extenconfig = extenconfig + 'exten => _' + mgr['amdprefix'] + '.,5,Goto(vmsagi,${EXTEN},1)\n\n'

            extenconfig = extenconfig + 'exten => _' + mgr['confprefix'] + '.,1,Goto(vmsmeetme,${EXTEN},1)\n\n'
            
            mgrconfig = mgrconfig + '[' + mgr['name'] + ']\n'
            mgrconfig = mgrconfig + 'secret=' + mgr['password'] + '\ndeny=0.0.0.0/0.0.0.0\n'
            mgrconfig = mgrconfig + 'writetimeout=' + str(mgr['amiWriteTimeout']) +  '\n'
            mgrconfig = mgrconfig + 'permit=' + mgr['hostip'] + '/255.255.255.255\nread = system,call,user,dtmf\nwrite = all \n\n'
            
            mgrconfig = mgrconfig + '[' + mgr['name'] + '-read]\n'
            mgrconfig = mgrconfig + 'secret=' + mgr['password'] + '\ndeny=0.0.0.0/0.0.0.0\n'
            mgrconfig = mgrconfig + 'writetimeout=' + str(mgr['amiWriteTimeout']) +  '\n'
            mgrconfig = mgrconfig + 'permit=' + mgr['hostip'] + '/255.255.255.255\nread = system,call,user,dtmf\nwrite = command \n\n'
            
            mgrconfig = mgrconfig + '[' + mgr['name'] + '-write]\n'
            mgrconfig = mgrconfig + 'secret=' + mgr['password'] + '\ndeny=0.0.0.0/0.0.0.0\n'
            mgrconfig = mgrconfig + 'writetimeout=' + str(mgr['amiWriteTimeout']) +  '\n'
            mgrconfig = mgrconfig + 'permit=' + mgr['hostip'] + '/255.255.255.255\nread = \nwrite = all \n\n'
        
        
        for route in self.orm.outroutes.find({}):
            if 'routePrefix' in route and route['routePrefix'] is None:
                continue
            if route['routeLength'] == 'any':
                exten = '_' + route['routePrefix'] + '.'
            else:
                if route['routeLength'].isdigit() == False:
                    logging.info('error','length of Digits for Route: '+ '\"' + route['routeName']  + '\" needs to be a number')
                    continue
            
                exten = '_' + route['routePrefix']
                for i in range(1, int(route['routeLength'])):
                    if len(exten) - 1 >= int(route['routeLength']): break
                    exten = exten + 'X'
                
            extenconfig = extenconfig + 'exten => ' + exten + ',1,Gosub(getlegfromchannel,s,1(${CHANNEL}))\n'
            extenconfig = extenconfig + 'exten => ' + exten + ',2,ExecIf($[${LEN(${dialTimeout})} > 0]?Wait(0.5):Set(dialTimeout=60))\n'
            extenconfig = extenconfig + 'exten => ' + exten + ',3,ExecIf($[\"${leg}\"= \"1\"]?Set(dialTimeout=${tsMakeCallTimeout}))\n'
            extenconfig = extenconfig + 'exten => ' + exten + ',4,ExecIf($[\"${leg}\"= \"2\"]?Set(dialTimeout=${tsCallbackTimeout}))\n'
            extenconfig = extenconfig + 'exten => ' + exten + ',5,Goto(eventoriginated,${EXTEN},1)\n'
            extenconfig = extenconfig + 'exten => ' + exten + ',6,Dial(PJSIP/' + route['trunkPrefix'] + '${EXTEN}@' + route['trunkSelect']['name']  + ',${dialTimeout},gU(macro-mt^${exten}^${CHANNEL}^${actionId}^${tsInterest}^${tsCalledId}^${tsParty}))\n'
            extenconfig = extenconfig + 'exten => ' + exten + ',7,Set(failover=' + str(route['useFailover']).lower() + ')\n'
            extenconfig = extenconfig + 'exten => ' + exten + ',8,Set(failoverTrunk=' + (route['failoverTrunkSelect']['name'] if 'failoverTrunkSelect' in route else '') + ')\n'
            extenconfig = extenconfig + 'exten => ' + exten + ',9,Set(myexten=${EXTEN})\n'
            if route['trunkPrefix'] is not None:
                extenconfig = extenconfig + 'exten => ' + exten + ',10,Set(trunkPrefix=' + str(route['trunkPrefix']).lower() + ')\n'

            extenconfig = extenconfig + 'exten => ' + exten + ',11,NoOP(Dial Status: ${DIALSTATUS})\n'
            extenconfig = extenconfig + 'exten => ' + exten + ',12,Goto(divoiceint,s-${DIALSTATUS},1)\n\n\n'
        
        
        extenconfig = extenconfig + '\n\n[inroutes]\n\n'
        for u in self.orm.inroutes.find({}):
            if u['selectDest'] == "echotest":
                extenconfig = extenconfig + 'exten => '+ u['routeNumber'] +',1,Dial(Local/600009@echotest)\n'
            elif u['selectDest'] == "audiofork":
                extenconfig = extenconfig + f"exten => {u['routeNumber']},1,Answer\n"
                extenconfig = extenconfig + f"same => n,Verbose(starting audio fork)\n"
                extenconfig = extenconfig + f"same => n,AudioFork({u['destWs']})\n"
                extenconfig = extenconfig + f"same => n,Verbose(audio fork was started continuing call..)\n"
                extenconfig = extenconfig + f"same => n,Playback(demo-echotest)   ; Let them know what's going on\n"
                extenconfig = extenconfig + f"same => n,Echo()                        ; Do the echo test\n"
                extenconfig = extenconfig + f"same => n,Playback(demo-echodone)       ; Let them know it's over\n"
                extenconfig = extenconfig + f"same => n,Goto(s,6)             ; Start over\n\n"
            elif 'inbound2exten' in u and u['inbound2exten'] == True:
                extenconfig = extenconfig + f"exten => {u['routeNumber']},1," + 'UserEvent(EventRinging,tsCallerid: ${CALLERID(num)},tsCalledid: ${EXTEN},tsChannel: ${CHANNEL}, server: ${SIPDOMAIN})\n'
                extenconfig = extenconfig + f"same => n," + "ExecIf($[${LEN(${dialTimeout})} > 0]?Wait(0.5):Set(dialTimeout=60))\n"
                extenconfig = extenconfig + f"same => n,Set(tsDirection=Incoming)\n"
                extenconfig = extenconfig + "same => n,Dial(PJSIP/${EXTEN}@" + u['selectDest'] +',${dialTimeout},gU(macro-mt^${exten}^${CHANNEL}^${actionId}^${tsInterest}^${tsCalledId}^${tsParty}^${tsDirection}))\n'
                extenconfig = extenconfig + f"same => n," + 'Set(failover=' + str(u['useFailover']).lower() + ')\n'
                extenconfig = extenconfig + f"same => n," + 'Set(failoverTrunk=' + u['selectFailoverDest'] + ')\n'
                extenconfig = extenconfig + f"same => n," + 'Set(myexten=${EXTEN})\n'
                extenconfig = extenconfig + f"same => n," + 'NoOP(Dial Status: ${DIALSTATUS})\n'
                extenconfig = extenconfig + f"same => n," + 'Goto(divoiceint,s-${DIALSTATUS},1)\n\n\n'
            else:
                if 'routeDestNumber' in u and u['routeDestNumber'] is None:
                    logging.info(f"{u['routeDestNumber']} is null for inroute")
                else:
                    if 'routeDestNumber'in u and u['routeDestNumber'] is not None and u['selectDest'] is not None:
                        extenconfig = extenconfig + 'exten => '+ u['routeNumber'] +',1,Dial(PJSIP/' +u['routeDestNumber'] + '@' + u['selectDest'] +')\n\n'
            
        extenconfig = extenconfig + 'exten => _+Z.,1,UserEvent(EventRinging,tsCallerid: ${CALLERID(num)},tsCalledid: ${EXTEN},tsChannel: ${CHANNEL}, server: ${SIPDOMAIN})\n'
        extenconfig = extenconfig + 'same => n,ExecIf($[${LEN(${dialTimeout})} > 0]?Wait(0.5):Set(dialTimeout=60))\n'
        extenconfig = extenconfig + 'same => n,Set(tsDirection=Incoming)\n'
        extenconfig = extenconfig + 'same => n,Dial(${CHANNEL:0:-9}/${EXTEN},${dialTimeout},gU(macro-mt^${exten}^${CHANNEL}^${actionId}^${tsInterest}^${tsCalledId}^${tsParty}^${tsDirection}))\n'
        extenconfig = extenconfig + 'same => n,NoOP(Dial Status: ${DIALSTATUS})\n'
        extenconfig = extenconfig + 'same => n,Goto(divoiceint,s-${DIALSTATUS},1)\n\n\n'

        
        extenconfig = extenconfig + '\n\n[ab_conferences]\n'
        
        fo = open(self.astcfg_dir + '/extensions_vms.conf','w+')
        fo2 = open(self.astcfg_dir + '/manager_unify.conf','w+')
        fo2.write(mgrconfig)
        fo.write(extenconfig)
        logging.info('extensions_gtms.conf and manager_unify.conf written')
        fo.close()
        fo2.close()

        fo3 = open(self.astcfg_dir + '/pjsip_endpoints.conf','w+')
        fo31 = open(self.astcfg_dir + '/pjsip_aors.conf','w+')
        fo32 = open(self.astcfg_dir + '/pjsip_auth.conf','w+')
        fo33 = open(self.astcfg_dir + '/pjsip_identity.conf','w+')
        fo3 = open(self.astcfg_dir + '/pjsip_endpoints.conf','w+')
        
        sipconfigfile = ''
        aorsconfigfile = ''
        authconfigfile = ''
        idconfigfile = ''

        for u in self.orm.sipusers.find({}):
            sipconfigfile = sipconfigfile + '[' + u['name'] + ']\n'
            aorsconfigfile = aorsconfigfile + '[' + u['name'] + ']\n'
            aorsconfigfile = aorsconfigfile + "type=aor\n"
            sipconfigfile = sipconfigfile + "type=endpoint\n"
            if u['type'] == 'peer':
                sipconfigfile = sipconfigfile + "context=from-gtms-external\n"
                aorsconfigfile = aorsconfigfile + f"contact=sip:{u['host']}:{u['port']}\n"
                idconfigfile = idconfigfile + '[' + u['name'] + ']\n'
                idconfigfile = idconfigfile + "type=identify\n"
                idconfigfile = idconfigfile + f"endpoint={u['name']}\n"
                idconfigfile = idconfigfile + f"match={u['host']}\n"

            else: 
                sipconfigfile = sipconfigfile + f"context={u['context']}\n"
                aorsconfigfile = aorsconfigfile + "max_contacts=1\n"
            sipconfigfile = sipconfigfile + "disallow=all\n"
            for codec in self.orm.getConfig()['enabled_codecs']:
                sipconfigfile = sipconfigfile + f"allow={codec}\n"
            sipconfigfile = sipconfigfile + f"dtmf_mode={u['dtmfmode']}\n"
            sipconfigfile = sipconfigfile + f"aors={u['name']}\n"
            aorsconfigfile = aorsconfigfile + f"qualify_frequency=60\n"

            if 'username' in u and 'password' in u and u['username'] is not None and u['password'] is not None:
                authconfigfile = authconfigfile + '[' + u['name'] + ']\n'
                authconfigfile = authconfigfile + "type=auth\n"
                authconfigfile = authconfigfile + f"username={u['username']}\n"
                authconfigfile = authconfigfile + f"password={u['password']}\n"
                sipconfigfile = sipconfigfile + f"auth={u['name']}\n"
                sipconfigfile = sipconfigfile + f"outbound_auth={u['name']}\n"


            sipconfigfile = sipconfigfile + '\n\n\n\n'
            aorsconfigfile = aorsconfigfile + '\n\n\n\n'
            authconfigfile = authconfigfile + '\n\n\n\n'
            idconfigfile = idconfigfile + '\n\n\n\n'
    
        fo3.write(sipconfigfile)
        fo3.close()
        fo31.write(aorsconfigfile)
        fo31.close()
        fo32.write(authconfigfile)
        fo32.close()
        fo33.write(idconfigfile)
        fo33.close()
        self.cli('core reload')
        
