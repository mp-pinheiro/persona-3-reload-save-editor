CREDITS = "https://github.com/afkaf/Python-GVAS-JSON-Converter"
import json, binascii,time, os, tempfile, struct, sys
from SavConverter import sav_to_json, read_sav, json_to_sav, load_json
class Encryption:
    def __init__(self):
        pass
    def XORshift(self,file,key,mode):
        keylen=len(key)
        with open(file,'rb') as f:
            data1=f.read()
        filesize=os.path.getsize(file)
        crypt_data = bytearray(filesize)

        for i in range(filesize):
            key_idx = i % keylen
            if mode == "dec":
                bVar1=data1[i]^ord(key[key_idx])
                crypt_data[i] = (bVar1 >> 4 & 3 | (bVar1 & 3) << 4 | bVar1 & 0xcc)
            elif mode == "enc":
                crypt_data[i]=((((data1[i] & 0xff) >> 4) & 3 | (data1[i] & 3) << 4 | data1[i] & 0xcc) ^ ord(key[key_idx]))
        return crypt_data
class OpenSave:
    def __init__(self):
        pass
    def Load(self,i,mdd,e,make_bak):
        try:
            dec_data = Encryption().XORshift(i+"\\"+e,"ae5zeitaix1joowooNgie3fahP5Ohph","dec")            
            with tempfile.NamedTemporaryFile(mode='wb',suffix='.sav', delete=False) as temp_file:
                temp_file.write(dec_data)
                temp_file_path = temp_file.name
                temp_file.flush
            json_data= sav_to_json(read_sav(temp_file_path), string = True)
            os.remove(temp_file_path)
            comp=True
        except:
            os.remove(temp_file_path)
            dec_data=open(i+"\\"+e,"rb").read()
            with tempfile.NamedTemporaryFile(mode='wb',suffix='.sav', delete=False) as temp_file:
                temp_file.write(dec_data)
                temp_file_path = temp_file.name
                temp_file.flush
            json_data= sav_to_json(read_sav(temp_file_path), string = True)
            os.remove(temp_file_path)
            comp=False
            
        with tempfile.NamedTemporaryFile(mode='w',suffix='.json', delete=False) as temp_file:
            temp_file.write(json_data)
            temp_file_path = temp_file.name
            temp_file.flush
        return Persona3Save(temp_file_path,mdd,i,e,make_bak,comp)
class Persona3Save:
    def __init__(self,i,mdd,ww,qq,make_bak,comp):
        self.padding={"UInt32Property":"04000000","Int8Property":"01000000","UInt16Property":"02000000"}
        self.encrypted=comp
        self.make_bak_file=make_bak
        self.filenamestart=ww
        self.filenameend=qq
        with open(i,"r") as f:
            self.js=json.load(f)
        os.remove(i)
        self.LoadData()
        if mdd==0:
            while True:
                command=input("(type help to see comand): ").lower()
                if command == None:
                    pass
                elif command == "edit lastname":
                    self.LastName()
                elif command == "edit money":
                    self.Money()
                elif command == "edit date":
                    self.Date()
                elif command == "edit persona" or command == "edit personas":
                    self.Personas()
                elif command == "edit playtime":
                    self.Playtime()
                elif command == "edit difficulty":
                    self.Difficulty()
                elif command == "edit sociallink" or command == "edit sociallinks" or command == "edit social-link" or command == "edit social-links" or command == "edit social link" or command == "edit social links":
                    self.Sociallink()
                elif command == "edit firstname":
                    self.FirstName()
                elif command == "edit characters" or command == "edit character":
                    self.Characters()
                elif command == "edit socialrank" or command == "edit socialranks":
                    self.Socialrank()
                elif command == "edit dangerous":
                    self.Dangerous()
                elif command == "achievement progress" or command == "achievements":
                    self.AchievementProgress()
                elif command == "get" or command[0:4] == "get ":
                    a=command.split(" ")
                    if len(a) == 2:
                        try:
                            z=self.SaveHeader[a[1]]
                            print("")
                            print(z)
                        except:
                            try:
                                if type(self.Data[a[1]]) != dict:
                                    print("")
                                    print(self.Data[a[1]])
                                else:
                                    print("")
                                    print(None)
                            except:
                                pass
                elif command=="print":
                    print("")
                    for i in self.SaveHeader.keys():
                        if not "len" in i.lower():
                            print(i)
                    for i in self.Data.keys():
                        print(i)
                elif command == "json":
                    with open("n_json.txt","w") as f:
                        json.dump(self.js, f, indent=4)
                elif command == "save":
                    self.SaveChange()
                elif command == "help":
                    print("")
                    print("exit|quit : to exit\nsave : save edited data in the save file\nprint : show editable value\nedit 'value_name' : edit the value of 'value_name'\nget 'value_name' : get the value of 'value_name'\nachievements : show achievement progress")
                elif command == "exit" or command == "quit":
                    break
                else:
                    print("Invalid | type help to see possible commnad/value to modify")
    def LoadData(self):
        self.filename=self.LoadByName(self.js[1]["value"],"SaveSlotName",1,1)
        self.SaveHeader={}
        
        self.SaveHeader["lastname"]=self.LoadByName(self.js[1]["value"],"LastName",1,1)
        self.SaveHeader["firstname"]=self.LoadByName(self.js[1]["value"],"FirstName",1,1)
        self.SaveHeader["LenLastName"]=len(self.SaveHeader["lastname"])
        self.SaveHeader["LenFirstName"]=len(self.SaveHeader["firstname"])
        self.Data={}
        self.Data["money"]=self.LoadByNameN(self.js, "UInt32Property", 0,7261)
        self.Data["playtime"] = self.LoadByNameN(self.js, "UInt32Property", 0,12836)
        self.Data["characters"]={self.SaveHeader["firstname"].lower():{"current_pv":13074,"current_pc":13075,"level":13078,"exp":13079},"yukari":{"current_pv":13250,"current_pc":13251,"level":13267,"exp":13268},"junpei":{"current_pv":13426,"current_pc":13427,"level":13443,"exp":13444}}
        self.Data["dangerous"]={"player_x":self.LoadByNameN(self.js, "UInt32Property", 0,5223),"player_y":self.LoadByNameN(self.js, "UInt32Property", 0,5224),"player_direction":self.LoadByNameN(self.js, "UInt32Property", 0,5222)}#"player_z":self.LoadByNameN(self.js, "UInt32Property", 0,5221)}
        self.Data["socialrank"] = {"academics":5356,"charm":5358,"courage":5360}
        self.Data["date"]={"time":1933,"day":1932}#dayskip = 1934
        self.Data["personavalueid"]={"persona":[13090,13102,13114,13126,13138,13150,13162],"level":[13091,13103,13115,13127,13139,13151,13163],"exp":[13092,13104,13116,13128,13140,13152,13164],"skill_slot_1":[13093,13105,13117,13129,13141,13153,13165],"skill_slot_2":[13094,13106,13118,13130,13142,13154,13166],"skill_slot_3":[13095,13107,13119,13131,13143,13155,13167],"skill_slot_4":[13096,13108,13120,13132,13144,13156,13168],"fo_ma_en_ag":[13097,13109,13121,13133,13145,13157,13169],"ch":[13098,13110,13122,13134,13146,13158,13170]}#,"skill_slot_4":[0,0,0,0,13143,0]}
        self.Data["sociallink"]={"aigis":5346,"nyx annihilation team":5344,"kamiki":5342,"suemitsu":5340,"hayase":5338,"mutatsu":5336,"tanaka":5334,"bebe":5332,"pharos":5330,"maiko":5328,"nishiwaki":5326,"hiraga":5324,"maya":5322,"fushimi":5320,"miyamoto":5318,"takeba":5316,"kitamura":5314,"odagiri":5312,"kirijo":5310,"yamagishi":5308,"tomochika":5306,"sees":5304}
        self.Data["exploration"]={"twilight_fragments_found":1429,"monad_doors":1393,"treasure_chests":7909,"twilight_fragments_used":1431}
        self.Data["activities"]={"job_earnings":516}
    def SaveChange(self):
        with tempfile.NamedTemporaryFile(mode='w',suffix='.json', delete=False) as temp_file:
            json.dump(self.js, temp_file, indent=2)
            temp_file_path = temp_file.name
            temp_file.flush
        binary_save = json_to_sav(load_json(temp_file_path))
        
        os.remove(temp_file_path)
        if self.encrypted == True:
            with tempfile.NamedTemporaryFile(mode='wb',suffix='.sav', delete=False) as temp_file:
                temp_file.write(binary_save)
                temp_file_path = temp_file.name
                temp_file.flush
            enc_data = Encryption().XORshift(temp_file_path,"ae5zeitaix1joowooNgie3fahP5Ohph","enc")
            os.remove(temp_file_path)
        else:
            enc_data=binary_save
        if self.make_bak_file == True:
            if os.path.isdir(self.filenamestart+"\\backup") == False:
                os.mkdir(self.filenamestart+"\\backup")
            with open(f"{self.filenamestart}\\{self.filenameend}","rb") as fr:
                back_data=fr.read()
            with open(f"{self.filenamestart}\\backup\\{str(int(time.time()))+'_'+self.filenameend}","wb") as fb:
                fb.write(back_data)            
        with open(f"{self.filenamestart}\\{self.filenameend}","wb") as f:
            f.write(enc_data)
    def int_to_hex(self,int_value):
        return ''.join([(hex(int_value)[2:].zfill(8))[i:i+2] for i in range(6, -2, -2)])
    def debug_GetIdByValue(self,js,name,header,value):
        d=[]
        if header == 0:
            for i in js[:]:
                if i["type"]== name:
                    if i["value"]==value:
                        d.append((int.from_bytes(binascii.unhexlify(i["padding"]),byteorder="little")))
        return d
    def SaveByNameN(self,js, name, header, nvar,n,after=None):
        xx=False
        padd=0
        if header == 0:
            for i in js[:]:
                padd+=1
                if i["type"]== name:
                    if xx==True:
                        js.insert(padd,{
                        "type": "UInt32Property",
                        "name": "SaveDataArea",
                        "padding_static": "04000000",
                        "padding": self.int_to_hex(n),
                        "value": nvar
                        })
                        xx==False
                    if int.from_bytes(binascii.unhexlify(str(i["padding"])),byteorder="little") == n:
                        i["value"]=nvar
                        return js
                    elif int.from_bytes(binascii.unhexlify(str(i["padding"])),byteorder="little") == after:
                        xx=True
        if after==None:
            js.insert(len(js)-1,{
            "type": "UInt32Property",
            "name": "SaveDataArea",
            "padding_static": "04000000",
            "padding": self.int_to_hex(n),
            "value": nvar
            })
        return js
    def DelByNameN(self,js, name, header, n):
        if header == 0:
            for i in js[:]:
                if i["type"]== name:
                    if int.from_bytes(binascii.unhexlify(str(i["padding"])),byteorder="little") == n:
                        js.remove(i)
            return js
    def SaveByName(self, js, name, mode, header, nvar, typee, lenn=None, dummy=None):
        c = 0
        d = 0
        r = False
        x_hex=-1
        for i in js[:]:
            try:
                if i["name"] == name:
                    js.remove(i)
            except:
                pass
        x_padding=-1
        x_value=-1
        if mode == 0:
            nbr=1
        elif mode == 1:
            nbr=len(nvar)
        for i in range(nbr):
            try:
                if mode == 1:
                    x_value+=1
                    number=hex(ord(nvar[x_value])).replace("0x","")
                    if len(number)%2==1:
                        number=f"0{number}"
                    number = self.split_string(number,2)
                    for ise in number:
                        x_padding+=1
                        js.insert(len(js)-1, {"type":typee,"name":name,"padding_static":self.padding[typee],"padding":self.int_to_hex(x_padding),"value":int.from_bytes(binascii.unhexlify(ise), byteorder="big", signed=True)})
                
                elif mode == 0:
                    js.insert(len(js)-1, {"type":typee,"name":name,"padding_static":self.padding[typee],"padding":self.int_to_hex(0),"value":nvar})
            except:
                pass
        return js
    def LoadByNameN(self,js, name, header,n):
        if header == 0:
            for i in js[:]:
                if i["type"]== name:
                    if int.from_bytes(binascii.unhexlify(i["padding"]),byteorder="little") == n:
                        return i["value"]
        return None
    def LoadByName(self,js,name,mode,header):
        tmp=[]
        c=0
        for i in js:                
            if header==1:
                try:
                    if i["name"]==name:
                        if i["type"]=="StrProperty":
                            return i["value"]
                        tmp.append([int.from_bytes(binascii.unhexlify(i["padding"]),byteorder="little"),binascii.hexlify((i["value"]).to_bytes(1, byteorder='big', signed=True)).decode()])
                        
                except:
                    pass
            else:
                if c>1:
                    try:
                        if i["name"] == name:
                            tmp+=format((i["value"]& 0xFFFFFFFF), '08x')  
                    except:
                        pass
                c+=1
        a=sorted(tmp, key=lambda x: x[0])
        tmp=""
        for i in a:
            tmp+=i[1]
        if len(tmp)>0:
            if mode==1:
                return binascii.unhexlify(tmp).decode("utf-8", errors="ignore")
            return binascii.unhexlify(tmp)
        return None
    def str_to_int(self,i):
        strr=""
        for a in i:
            strr+=hex(ord(a))[2:].zfill(2)
        return int.from_bytes(binascii.unhexlify(strr),byteorder="little")    
    def split_string(self,string,nbr,val=False):
        if val == True:
            string=binascii.hexlify(string.encode()).decode()
        new_lst=[]
        iq=0
        strr=""
        for i in string:
            iq+=1
            strr+=i
            if iq == nbr:
                iq=0
                new_lst.append(strr)
                strr=""
        if strr != "":
            new_lst.append(strr)
        return new_lst
                
            
            
    """ Method """
    
    def LastName(self):
        while True:
            new_name=input("New LastName (10 char max | put nothing to cancel): ")
            if len(new_name)<=10 and len(new_name)>0:
                aaa=True
                for i in new_name:
                    if len(binascii.hexlify(i.encode()).decode()) > 2:
                        aaa=False
                if aaa == True:
                    self.js[1]["value"]=self.SaveByName(self.js[1]["value"],"LastName",1,1,new_name,"Int8Property",self.SaveHeader["LenLastName"],'{"type": "Int8Property", "name": name,"padding_static":static,"padding":self.int_to_hex(x_hex), "value": ord(nvar[c - 1])}')
                    self.SaveHeader["lastname"] = new_name
                    self.SaveHeader["LenLastName"]=len(new_name)
                    new_name = self.split_string(new_name,8,True)
                    counter=0
                    for i in [0,0,0,0,0,0,0,0]:
                        self.js=self.DelByNameN(self.js, "UInt32Property", 0,17954+counter)
                    counter=0
                    for i in new_name:
                        counter+=1
                        self.js=self.SaveByNameN(self.js, "UInt32Property", 0, int.from_bytes(binascii.unhexlify(i),byteorder="little"),17954+counter)
                    print(new_name)
                    break
            elif len(new_name)==0:
                break
    def FirstName(self):
        while True:
            new_name=input("New FirstName (10 char max | put nothing to cancel): ")
            if len(new_name)<=10 and len(new_name)>0:
                aaa=True
                for i in new_name:
                    if len(binascii.hexlify(i.encode()).decode()) > 2:
                        aaa=False
                if aaa == True:
                    self.js[1]["value"]=self.SaveByName(self.js[1]["value"],"FirstName",1,1,new_name,"Int8Property",self.SaveHeader["LenFirstName"],'{"type": "Int8Property", "name": name,"padding_static":static,"padding":self.int_to_hex(x_hex), "value": ord(nvar[c - 1])}')
                    self.SaveHeader["firstname"] = new_name
                    self.SaveHeader["LenFirstName"]=len(new_name)
                    new_name = self.split_string(new_name,8,True)
                    counter=0
                    for i in [0,0,0,0,0,0,0,0]:
                        self.js=self.DelByNameN(self.js, "UInt32Property", 0,17938+counter)
                    counter=0
                    for i in new_name:
                        counter+=1
                        self.js=self.SaveByNameN(self.js, "UInt32Property", 0, int.from_bytes(binascii.unhexlify(i),byteorder="little"),17938+counter)
                    print(new_name)
                    break
            elif len(new_name)==0:
                break
    def Characters(self):
        characters = [self.SaveHeader["firstname"].lower(),"yukari","junpei"]
        while True:
            print(f"\nChose the characters to edit (put nothing to exit 'Characters' editing) :\n    1 : {self.SaveHeader['firstname']}\n    2 : {characters[1][0:1].upper()+characters[1][1:len(characters[1])]}\n    3 : {characters[2][0:1].upper()+characters[2][1:len(characters[2])]}")
            a = input().lower()
            if a in ["1","2","3"]:
                if a == "1":
                    bbc=self.SaveHeader['firstname']
                else:
                    bbc=characters[int(a)-1][0:1].upper()+characters[int(a)-1][1:len(characters[int(a)-1])]
                while True:
                    command = input(f"(type help to see comand) ('{bbc}' stats editing) :  ").lower()
                    if command == "edit current_pv":
                        while True:
                            z=input(F"New {bbc} PV (to increase Max PV, increase the Level) (999 max | put nothing to cancel): ")
                            if z == "":
                                break
                            else:
                                try:
                                    z=int(z)
                                    if z>0 and z < 1000:
                                        self.js=self.SaveByNameN(self.js, "UInt32Property", 0, z,self.Data["characters"][characters[int(a)-1]]["current_pv"])
                                        break
                                except:
                                    pass
                    elif command == "edit current_pc":
                        while True:
                            z=input(F"New {bbc} PC (to increase Max PC, increase the Level) (999 max | put nothing to cancel): ")
                            if z == "":
                                break
                            else:
                                try:
                                    z=int(z)
                                    if z>0 and z < 1000:
                                        self.js=self.SaveByNameN(self.js, "UInt32Property", 0, z,self.Data["characters"][characters[int(a)-1]]["current_pc"])
                                        break
                                except:
                                    pass
                    elif command == "edit level":
                        while True:
                            z=input(F"New {bbc} Level (99 max | put nothing to cancel): ")
                            if z == "":
                                break
                            else:
                                try:
                                    z=int(z)
                                    if z>0 and z < 100:
                                        if a == "1":
                                            self.js[1]["value"]=self.SaveByName(self.js[1]["value"],"PlayerLevel",0,1,z,"UInt32Property")
                                        self.js=self.SaveByNameN(self.js, "UInt32Property", 0, z,self.Data["characters"][characters[int(a)-1]]["level"])
                                        break
                                except:
                                    pass
                    elif command == "edit exp":
                        while True:
                            z=input(F"New {bbc} Exp (4294967295 max | put nothing to cancel): ")
                            if z == "":
                                break
                            else:
                                try:
                                    z=int(z)
                                    if z>0 and z < 4294967296:
                                        self.js=self.SaveByNameN(self.js, "UInt32Property", 0, z,self.Data["characters"][characters[int(a)-1]]["exp"])
                                        break
                                except:
                                    pass
                    
                    
                    elif command=="print":
                        for i in self.Data["characters"][characters[int(a)-1]].keys():
                            print(i)
                    elif command == "get" or command[0:4] == "get ":
                        av=command.split(" ")
                        if len(av) == 2:
                            try:
                                print("")
                                print(self.LoadByNameN(self.js, "UInt32Property", 0,self.Data["characters"][characters[int(a)-1]][av[1]]))
                            except Exception as e:
                                pass
                    elif command == "back":
                        break
                    elif command == "help":
                        print("")
                        print(f"back : to exit {bbc} editing\nprint : show editable value name\nedit 'value_name' : edit the value of 'value_name'\nget 'value_name' : get the value of 'value_name'")
            elif a == None:
                pass
            
            elif a == "":
                break
    def Sociallink(self):
        character_name=['SEES', 'Tomochika', 'Yamagishi', 'Kirijo', 'Odagiri', 'Kitamura', 'Takeba', 'Miyamoto', 'Fushimi', 'Maya', 'Hiraga', 'Nishiwaki', 'Maiko', 'Pharos', 'Bebe', 'Tanaka', 'Mutatsu', 'Hayase', 'Suemitsu', 'Kamiki', 'Nyx Annihilation Team', 'Aigis']
        
        while True:
            print(f"\nChose the social-link to edit (put nothing to exit 'Social-Link' editing) :")
            counter=0
            for i in character_name:
                counter+=1
                print(f"    {counter} : {i}")      
            a = input().lower()
            if a in ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22']:
                bbc=character_name[int(a)-1].lower()
                bbc2=character_name[int(a)-1]
                while True:
                    command = input(f"(type help to see comand) (Social-Link editing {bbc2}): ")
                    int("00000032",16)
                    if command == "edit level":
                        integer = self.LoadByNameN(self.js, "UInt32Property", 0,self.Data["sociallink"][bbc])
                        if integer == None:
                            integer = 0
                        load=binascii.hexlify(int.to_bytes(integer,4,byteorder="big")).decode()
                        level_load=load[4:len(load)]
                        point_load=load[0:4]
                        while True:
                            new_level=input(f"New {bbc2} relation level (10 max | put nothing to cancel): ")
                            try:
                                new_level= int(new_level)
                                if new_level > 0 and new_level <= 10:
                                    if new_level == 10:
                                        point_load = "0000"
                                    load=point_load+binascii.hexlify(int.to_bytes(new_level,2,byteorder="big")).decode()
                                    self.js=self.SaveByNameN(self.js, "UInt32Property", 0,int(load,16),self.Data["sociallink"][bbc])
                                elif new_level == 0:
                                    self.js=self.DelByNameN(self.js, "UInt32Property", 0,self.Data["sociallink"][bbc])
                                new_bin="0b"
                                for iuesn in self.Data["sociallink"].values():
                                    tempp=self.LoadByNameN(self.js, "UInt32Property", 0,iuesn)
                                    if tempp != None and tempp > 0:
                                        new_bin+="1"
                                    else:
                                        new_bin+="0"
                                new_bin=eval(new_bin)
                                self.js=self.SaveByNameN(self.js, "UInt32Property", 0,new_bin,107)
                                break
                            except:
                                if new_level == "":
                                    break
                    elif command == "edit point":
                        integer = self.LoadByNameN(self.js, "UInt32Property", 0,self.Data["sociallink"][bbc])
                        if integer == None:
                            integer = 0
                        load=binascii.hexlify(int.to_bytes(integer,4,byteorder="big")).decode()
                        level_load=load[4:len(load)]
                        point_load=load[0:4]
                        while True:
                            new_point=input(f"New {bbc2} relation points (100 max | put nothing to cancel): ")
                            try:
                                new_point= int(new_point)
                                if new_point > 0 and new_point <= 100:
                                    if int(level_load,16) < 10 and int(level_load,16) > 0:
                                        load=binascii.hexlify(int.to_bytes(new_point,2,byteorder="big")).decode()+level_load
                                        self.js=self.SaveByNameN(self.js, "UInt32Property", 0,int(load,16),self.Data["sociallink"][bbc])
                                        break
                                    else:
                                        print("Can't edit point if relation level is 10 or 0")
                                        break
                            
                            except Exception as e:
                                print(e)
                                if new_point == "":
                                    break                    
                    elif command=="print":
                        print("level\npoints")
                    elif command == "get" or command[0:4] == "get ":
                        integer = self.LoadByNameN(self.js, "UInt32Property", 0,self.Data["sociallink"][bbc])
                        load=binascii.hexlify(int.to_bytes(integer,4,byteorder="big")).decode()
                        level_load=load[4:len(load)]
                        point_load=load[0:4]
                        av=command.split(" ")
                        if len(av) == 2:
                            if av[1] == "level" or av[1] == "levels":
                                print(f'\n{int(level_load,16)}')  
                            elif av[1] == "point" or av[1] == "points":
                                print(f"\n{int(point_load,16)}")
                    elif command == "back":
                        break
                    elif command == "help":
                        print("")
                        print(f"back : to exit {bbc2} relation editing\nprint : show editable value name\nedit 'value_name' : edit the value of 'value_name'\nget 'value_name' : get the value of 'value_name'")
            elif a == "":
                break
    def Socialrank(self):
        while True:
            command = input(f"(type help to see comand) (social-rank editing) :  ")
            if command == "edit charm":
                while True:
                    z=input(F"New charm (100 max | put nothing to cancel): ")
                    if z == "":
                        break
                    else:
                        try:
                            z=int(z)
                            if z>0 and z < 101:
                                self.js=self.SaveByNameN(self.js, "UInt32Property", 0, z,self.Data["socialrank"]["charm"])
                                break
                        except:
                            pass
            elif command == "edit academics":
                while True:
                    z=input(F"New academics (230 max | put nothing to cancel): ")
                    if z == "":
                        break
                    else:
                        try:
                            z=int(z)
                            if z>0 and z < 231:
                                self.js=self.SaveByNameN(self.js, "UInt32Property", 0, z,self.Data["socialrank"]["academics"])
                                break
                        except:
                            pass
            elif command == "edit courage":
                while True:
                    z=input(F"New courage (80 max | put nothing to cancel): ")
                    if z == "":
                        break
                    else:
                        try:
                            z=int(z)
                            if z>0 and z < 81:
                                self.js=self.SaveByNameN(self.js, "UInt32Property", 0, z,self.Data["socialrank"]["courage"])
                                break
                        except:
                            pass
            
            
            elif command=="print":
                for i in self.Data["socialrank"].keys():
                    print(i)
            elif command == "get" or command[0:4] == "get ":
                av=command.split(" ")
                if len(av) == 2:
                    try:
                        print("")
                        print(self.LoadByNameN(self.js, "UInt32Property", 0,self.Data["socialrank"][av[1]]))
                    except Exception as e:
                        pass
            elif command == "back":
                break
            elif command == "help":
                print("")
                print(f"back : to exit social-rank editing\nprint : show editable value name\nedit 'value_name' : edit the value of 'value_name'\nget 'value_name' : get the value of 'value_name'")
    def GetClearStatus(self):
        """Extract ClearStatus from SaveDataHeadder in the header."""
        for prop in self.js:
            if hasattr(prop, 'type') and hasattr(prop, 'name'):
                if prop.type == 'StructProperty' and prop.name == 'SaveDataHeadder':
                    if hasattr(prop, 'value'):
                        for item in prop.value:
                            if hasattr(item, 'name') and item.name == 'ClearStatus':
                                return item.value
        return None
    def AchievementProgress(self):
        import binascii

        social_links = [
            ('SEES', 5304), ('Tomochika', 5306), ('Yamagishi', 5308),
            ('Kirijo', 5310), ('Odagiri', 5312), ('Kitamura', 5314),
            ('Takeba', 5316), ('Miyamoto', 5318), ('Fushimi', 5320),
            ('Maya', 5322), ('Hiraga', 5324), ('Nishiwaki', 5326),
            ('Maiko', 5328), ('Pharos', 5330), ('Bebe', 5332),
            ('Tanaka', 5334), ('Mutatsu', 5336), ('Hayase', 5338),
            ('Suemitsu', 5340), ('Kamiki', 5342), ('Nyx Annihilation Team', 5344),
            ('Aigis', 5346)
        ]

        unlocked = []
        maxed = []
        not_started = []
        in_progress = []

        for name, sl_id in social_links:
            value = self.LoadByNameN(self.js, "UInt32Property", 0, sl_id)
            if value and value > 0:
                bytes_val = value.to_bytes(4, 'little')
                level = bytes_val[0]
                if level == 0:
                    not_started.append(name)
                elif level == 10:
                    maxed.append(name)
                    unlocked.append(name)
                else:
                    unlocked.append(name)
                    in_progress.append((name, level))
            else:
                not_started.append(name)

        # Social Stats
        academics = self.LoadByNameN(self.js, "UInt32Property", 0, 5356) or 0
        charm = self.LoadByNameN(self.js, "UInt32Property", 0, 5358) or 0
        courage = self.LoadByNameN(self.js, "UInt32Property", 0, 5360) or 0

        # Date/Time for story progress
        day = self.LoadByNameN(self.js, "UInt32Property", 0, 1932) or 0
        time_of_day = self.LoadByNameN(self.js, "UInt32Property", 0, 1933) or 0

        # Story completion status
        clear_status = self.GetClearStatus()

        print("\n" + "="*60)
        print("           ACHIEVEMENT PROGRESS REPORT")
        print("="*60 + "\n")

        # === COMPLETED ACHIEVEMENTS ===
        print("=== COMPLETED ACHIEVEMENTS ===\n")

        print("[SOCIAL LINKS]")
        if len(maxed) > 0:
            print("  Unbreakable Link - Maxed out one Social Link")
            print(f"    Status: COMPLETE ({len(maxed)} Social Links at rank 10)")
        else:
            print("  Unbreakable Link - Maxed out one Social Link")
            print("    Status: NOT COMPLETE (no Social Link at rank 10)")
        print()

        print("[SOCIAL STATS]")
        specialist_complete = academics >= 230 or charm >= 100 or courage >= 80
        print("  Specialist - Maxed out one Social Stat")
        if specialist_complete:
            which = []
            if academics >= 230: which.append("Academics")
            if charm >= 100: which.append("Charm")
            if courage >= 80: which.append("Courage")
            print("    Status: COMPLETE (" + " | ".join(which) + ")")
        else:
            print("    Status: IN PROGRESS")
            print(f"    Academics: {academics}/230")
            print(f"    Charm: {charm}/100")
            print(f"    Courage: {courage}/80")
        print()

        peak_performance = academics >= 230 and charm >= 100 and courage >= 80
        print("  Peak Performance - Maxed out all Social Stats")
        if peak_performance:
            print("    Status: COMPLETE")
        else:
            print("    Status: IN PROGRESS")
            print(f"    Academics: {academics}/230")
            print(f"    Charm: {charm}/100")
            print(f"    Courage: {courage}/80")
        print()

        # === IN PROGRESS ACHIEVEMENTS ===
        print("=== IN PROGRESS ===\n")

        print("[SOCIAL LINKS]")
        people_person = len(unlocked) == 22
        print("  People Person - Unlocked all Social Links")
        print(f"    Progress: {len(unlocked)}/22 unlocked")
        if len(unlocked) < 22:
            print("    Missing: " + ", ".join(not_started))
        status = "COMPLETE" if people_person else "IN PROGRESS"
        print(f"    Status: {status}")
        print()

        legacy = len(maxed) == 22
        print("  A Legacy of Friendships - Maxed out all Social Links")
        print(f"    Progress: {len(maxed)}/22 maxed")
        if len(maxed) < 22:
            if in_progress:
                formatted = [f"{name} (Lv{level})" for name, level in in_progress]
                print("    In progress: " + ", ".join(formatted))
            if not_started:
                print("    Not started: " + ", ".join(not_started))
        status = "COMPLETE" if legacy else "IN PROGRESS"
        print(f"    Status: {status}")
        print()

        # === STORY PROGRESS ===
        print("[STORY PROGRESS]")
        print(f"  Current Day: {day}")
        print(f"  Time of Day: {time_of_day}")
        print("    (257=Morning, 258=Day, 259=Evening, 260=Night, 261=Late Night)")
        print()

        # Story completion (from ClearStatus)
        print("[STORY FLAGS]")
        print("  The Great Seal - Sealed Nyx")
        if clear_status is not None:
            print("    Status: COMPLETE")
            print(f"    ClearStatus: {clear_status}")
        else:
            print("    Status: NOT COMPLETE")
            print("    ClearStatus: Not set (game not completed)")
        print()

        print("  From Shadows into Light - Watched the good ending")
        if clear_status == 1:
            print("    Status: COMPLETE")
            print(f"    ClearStatus: {clear_status} (Good ending)")
        elif clear_status == 2:
            print("    Status: NOT COMPLETE")
            print(f"    ClearStatus: {clear_status} (Bad ending achieved)")
        else:
            print("    Status: NOT COMPLETE")
            print("    ClearStatus: Game not completed")
        print()

        # === CANNOT TRACK (NEEDS REVERSE ENGINEERING) ===
        print("=== CANNOT TRACK (REQUIRES DATA DISCOVERY) ===\n")

        print("[COMPENDIUM & FUSION]")
        print("  Path to Salvation - Fused Messiah")
        print("    Status: ? (Compendium ownership data not mapped)")
        print("    Discovery: Compare low vs high compendium saves")
        print()
        print("  The First of Many - Performed a Dyad Fusion")
        print("    Status: ? (Fusion counter not identified)")
        print()
        print("  Fusion Artisan - Performed 3+ Persona fusion")
        print("    Status: ? (Fusion counter not identified)")
        print()

        print("[COMBAT STATISTICS]")
        print("  Making the Dream Work - 50 All-Out Attacks")
        print("    Status: CANDIDATE IDs (per-teammate offset 32784)")
        all_out = self.LoadByNameN(self.js, "UInt32Property", 0, 7909)
        if all_out:
            print(f"    Current value (ID 7909): {all_out}/50")
        print("    Candidates: 7909, 40689, 73473, 106257, 139041, 171825, 204609")
        print()
        print("  There's No 'I' in 'Team' - Performed a Shift")
        print("    Status: CANDIDATE ID 576 (progressive 1-9)")
        shift = self.LoadByNameN(self.js, "UInt32Property", 0, 576)
        if shift:
            print(f"    Current value (ID 576): {shift}")
        print()
        print("  The Strength of Our Hearts - Used all teammates' Theurgy")
        print("    Status: ? (Theurgy flags not identified - need per-character data)")
        print()
        print("  Shrouded Assassin - 50 Chance Encounters")
        print("    Status: CANDIDATE IDs (per-teammate offset 32784)")
        encounters = self.LoadByNameN(self.js, "UInt32Property", 0, 13158)
        if encounters:
            print(f"    Current value (ID 13158): {encounters}/50")
        print("    Candidates: 13158, 45938, 78722, 111506, 144290, 177074, 209882")
        print()
        print("  Get a Load of Those Numbers! - 999+ damage")
        print("    Status: NOT FOUND (likely BoolProperty, not UInt32Property)")
        print()
        print("  Reaper Reaped - Defeated the Reaper")
        print("    Status: NOT FOUND (likely boss flag in story data)")
        print()
        print("  The Thrill of the Hunt - Defeated golden enemy")
        print("    Status: NOT FOUND (likely BoolProperty, not UInt32Property)")
        print()

        print("[EXPLORATION & COLLECTION]")
        print("  Briefcase Burglar - 50 treasure chests")
        print("    Status: CANDIDATE ID 7909 (range 47-50)")
        chests = self.LoadByNameN(self.js, "UInt32Property", 0, 7909)
        if chests:
            print(f"    Current value (ID 7909): {chests}")
            if chests >= 50:
                print("    Status: COMPLETE")
            else:
                print(f"    Progress: {chests}/50")
        else:
            print("    Value not found")
        print()
        print("  Glimpse of the Depths - 10 Monad doors")
        print("    Status: ID 1393 (with offset 32784 per teammate) - HIGH CONFIDENCE")
        monad = self.LoadByNameN(self.js, "UInt32Property", 0, 1393)
        if monad:
            print(f"    Current value (ID 1451): {monad}")
            if monad >= 10:
                print("    Status: COMPLETE")
            else:
                print(f"    Progress: {monad}/10")
        else:
            print("    Value not found")
        print()
        print("  The Horror of the Shade - Encountered Dark Zone")
        print("    Status: NOT FOUND (no boolean flag identified)")
        print()
        print("  Eagle Eye - All Twilight Fragments (124 total)")
        print("    Status: ID 1429 - HIGH CONFIDENCE")
        fragments = self.LoadByNameN(self.js, "UInt32Property", 0, 1429)
        if fragments:
            print(f"    Current value (ID 1449): {fragments}")
            if fragments >= 124:
                print("    Status: COMPLETE")
            else:
                print(f"    Progress: {fragments}/124")
        else:
            print("    Value not found")
        print()
        print("  Shattered Plumes - 50 Twilight Fragments used")
        print("    Status: ID 1431 - HIGH CONFIDENCE")
        used = self.LoadByNameN(self.js, "UInt32Property", 0, 1431)
        if used:
            print(f"    Current value (ID 13110): {used}")
            if used >= 50:
                print("    Status: COMPLETE")
            else:
                print(f"    Progress: {used}/50")
        else:
            print("    Value not found")
        print()

        print("[SOCIAL & ACTIVITIES]")
        print("  In High Demand - 5 invitations")
        print("    Status: ? (Invitation counter not identified)")
        print()
        print("  Dorm Life - Spent evening in dorm")
        print("    Status: ? (Dorm activity flag not identified)")
        print()
        print("  Distinguished Visitor - Elizabeth invitation")
        print("    Status: ? (Elizabeth flag not identified)")
        print()
        print("  Eat Your Veggies, Peas! - Harvested a crop")
        print("    Status: ? (Garden flag not identified)")
        print()
        print("  Benevolent Purr-tector - Nursed cat to full health")
        print("    Status: ? (Cat health flag not identified)")
        print()
        print("  Gourmand - Secret menu order")
        print("    Status: ? (Secret menu flag not identified)")
        print()
        print("  The Grindset Mindset - 50k yen from jobs")
        print("    Status: ID 516 - HIGH CONFIDENCE")
        job_earnings = self.LoadByNameN(self.js, "UInt32Property", 0, 516)
        if job_earnings:
            print(f"    Current earnings (ID 516): {job_earnings:,} yen")
            if job_earnings >= 50000:
                print("    Status: COMPLETE")
            else:
                print(f"    Progress: {job_earnings:,}/50,000 yen ({50000-job_earnings:,} more needed)")
        else:
            print("    Value not found")
        print()
        print("  Top of the Class - Aced an exam")
        print("    Status: ? (Exam flag not identified)")
        print()
        print("  Extracurricular Excellence - Rescued missing person")
        print("    Status: ? (Quest flag not identified)")
        print()
        print("  That Special Someone - Nurtured a romance")
        print("    Status: ? (Romance flag not identified)")
        print()

        print("[TEAM PROGRESSION]")
        print("  A Newfound Strength - All ultimate Personas")
        print("    Status: CANDIDATE IDs with value 127 (binary: 0b1111111 = 7 bits)")
        ultimate = self.LoadByNameN(self.js, "UInt32Property", 0, 201557)
        if ultimate:
            print(f"    Current value (ID 201557): {ultimate}/127")
            if ultimate == 127:
                print("    Status: COMPLETE (all 7 ultimate Personas unlocked)")
        print("    Candidates: 201557, 201605, 201669, 201717, 201733")
        print()
        print("  Through Thick and Thin - Combat Characteristic")
        print("    Status: CANDIDATE IDs with value 7 (7 teammates)")
        combat_char = self.LoadByNameN(self.js, "UInt32Property", 0, 201693)
        if combat_char:
            print(f"    Current value (ID 201693): {combat_char}")
        print("    Candidates: 201693, 201749 (near Ultimate Persona IDs)")
        print()

        print("[SHUFFLE TIME]")
        print("  The Fool's Journey - 10 Major Arcana")
        print("    Status: NOT CLEAR (many IDs with value 10, need more save variation)")
        print("    Candidates: 428, 513, 657, 658, 1395, 1399...")
        print()
        print("  The Power of Choice - 10 Personas")
        print("    Status: NOT CLEAR (need saves with different Shuffle progress)")
        print()
        print("  Beyond the Darkness - Remaining Major Arcana unlocked")
        print("    Status: ? (Story flag - likely linked to Death/SL progression)")
        print()
        print("  Beyond the Darkness - Remaining Arcana unlocked")
        print("    Status: ? (Arcana unlock flag not identified)")
        print()

        print("[DLC]")
        print("  Episode Aigis - All 8 achievements")
        print("    Status: ⊗ (Separate save structure, requires Episode Aigis saves)")
        print()

        print("="*60)
    def Playtime(self):
        while True:#8205188
            try:
                play = input("New Playtime (max 107998200 | put nothing to cancel): ")
                play=int(play)
                if play >= 0 and play <= 107998200:
                    self.js[1]["value"]=self.SaveByName(self.js[1]["value"],"PlayTime",0,1,play,"UInt32Property")
                    self.js=self.SaveByNameN(self.js, "UInt32Property", 0, play,12836)
                    self.Data["playtime"] = play
                    print(play)
                    break
            except:
                try:
                    if len(play)==0:
                        break
                except:
                    pass
    def Dangerous(self):
        while True:
            command = input(f"(type help to see comand) (unkwnown|dangerous|could break save) editing :  ").lower()
            if command == "edit player_x":
                while True:
                    z=input(F"New player_x (4294967295 max | put nothing to cancel): ")
                    if z == "":
                        break
                    else:
                        try:
                            z=int(z)
                            if z>0 and z <= 4294967295:
                                self.js=self.SaveByNameN(self.js, "UInt32Property", 0, z,5223)
                                break
                        except:
                            pass
            elif command == "edit player_y":
                while True:
                    z=input(F"New player_y (4294967295 max | put nothing to cancel): ")
                    if z == "":
                        break
                    else:
                        try:
                            z=int(z)
                            if z>0 and z <= 4294967295:
                                self.js=self.SaveByNameN(self.js, "UInt32Property", 0, z,5224)
                                break
                        except:
                            pass
            elif command == None:#"edit player_z":
                while True:
                    z=input(F"New player_z (4294967295 max | put nothing to cancel | UNCONFIRMED VALUE ID !): ")
                    if z == "":
                        break
                    else:
                        try:
                            z=int(z)
                            if z>0 and z <= 4294967295:
                                self.js=self.SaveByNameN(self.js, "UInt32Property", 0, z,5221)
                                break
                        except:
                            pass
            elif command == "edit player_direction":
                while True:
                    z=input(F"New player_z (4294967295 max | put nothing to cancel): ")
                    if z == "":
                        break
                    else:
                        try:
                            z=int(z)
                            if z>0 and z <= 4294967295:
                                self.js=self.SaveByNameN(self.js, "UInt32Property", 0, z,5222)
                                break
                        except:
                            pass
            elif command=="print":
                for i in self.Data["dangerous"].keys():
                    print(i)
            elif command == "get" or command[0:4] == "get ":
                a=command.split(" ")
                if len(a) == 2:
                    try:
                        print("")
                        print(self.Data["dangerous"][a[1]])
                    except:
                        pass
            elif command == "back":
                break
            elif command == "help":
                print("")
                print(f"back : to exit |dangerous editing\nprint : show editable value name\nedit 'value_name' : edit the value of 'value_name'\nget 'value_name' : get the value of 'value_name'")
            self.Data["dangerous"]={"player_x":self.LoadByNameN(self.js, "UInt32Property", 0,5223),"player_y":self.LoadByNameN(self.js, "UInt32Property", 0,5224),"player_z":self.LoadByNameN(self.js, "UInt32Property", 0,5221),"player_direction":self.LoadByNameN(self.js, "UInt32Property", 0,5222)}
    def Difficulty(self):
        difficultydata={"Beginner":2166366214,"Easy":2166374406,"Normal":2166390790,"Hard":2166423558,"Maniac":100794368}
        difficultychoose=["Beginner","Easy","Normal","Hard","Maniac"]
        while True:
            print("Choose Difficulty (put nothing to cancel :")
            counter=0
            for i in difficultychoose:
                counter+=1
                print(f"    {counter} : {i}")
            ss=input()
            if ss == "":
                break
            else:
                try:
                    ss=int(ss)
                    if ss > 0 and ss <= 5:
                        self.js=self.SaveByNameN(self.js, "UInt32Property", 0, difficultydata[difficultychoose[ss-1]],388)
                        break
                except:
                    pass
    
    def Date(self):
        timedata= [["Very early morning",257],["Early morning",258],["Morning",259],["Lunch break",260],["Afternoon",261], ["After school",262],["Evening",263],["Dark Hour",264],["Late evening",265]]
        daydata=[[30,31,30,31,31,30,31,30,31,31,28,4],{2009:["April","May","Juin","July","August","September","October","November","December"],2010:["January","Febuary","March"]}]
        while True:
            command = input(f"(type help to see comand) (date editing) :  ")
            if command == "edit day":
                while True:
                    z=input(F"Choose Year (2009-2010) (put nothing to cancel): ")
                    if z == "":
                        break
                    else:
                        try:
                            z=int(z)
                            if z == 2009 or z == 2010:
                                while True:
                                    print("Choose Month (put nothing to cancel) :")
                                    counter=0
                                    for az in daydata[1][z]:
                                        counter+=1
                                        print(f"    {counter} : {az}")
                                    z2=input()                    
                                    if z2 == "":
                                        break
                                    else:
                                        try:
                                            z2=int(z2)
                                            if (z == 2009 and (z2>0 and z2<10)) or (z == 2010 and (z2>0 and z2<4)):
                                                z2-=1
                                                if z == 2010:
                                                    z2+=9
                                                while True:
                                                    offset=0                                                        
                                                    if z2 > 0:
                                                        for iu in range(z2):
                                                            offset+=daydata[0][iu]
                                                    item = input(f"Choose Day ({daydata[0][z2]} Max) (put nothing to cancel) :")
                                                    if item == "":
                                                        break
                                                    else:
                                                        try:
                                                            item = int(item)
                                                            if (item > 0 and item <= daydata[0][z2]):
                                                                item=(offset+item)-1
                                                                self.js=self.SaveByNameN(self.js, "UInt32Property", 0, item,1932)
                                                                self.js=self.SaveByNameN(self.js, "UInt32Property", 0, item,1934)
                                                                break
                                                        except:
                                                            pass
                                                            
                                                            
                                                break
                                        except:
                                            pass
                                break
                        except:
                            pass
            elif command == "edit time":
                while True:
                    print(f"Chosse new hour (put nothing to cancel) (bad modification could break/soft-lock the game but you may fix it (not sure) by re-editing the save)\n    1 : {timedata[0][0]}\n    2 : {timedata[1][0]}\n    3 : {timedata[2][0]}\n    4 : {timedata[3][0]}\n    5 : {timedata[4][0]}\n    6 : {timedata[5][0]}\n    7 : {timedata[6][0]}\n    8 : {timedata[7][0]}\n    9 : {timedata[8][0]}")
                    z=input()
                    try:
                        z=int(z)
                        if z>0 and z < 10:
                            self.js=self.SaveByNameN(self.js, "UInt32Property", 0, timedata[z-1][1],self.Data["date"]["time"])
                            break
                    except:
                          try:
                              if len(z)==0:
                                  break
                          except:
                              pass
            elif command=="print":
                for i in self.Data["date"].keys():
                    print(i)
            elif command == "get" or command[0:4] == "get ":
                av=command.split(" ")
                if len(av) == 2:
                    try:
                        print("")
                        if av[1] == "time":
                            print(timedata[(self.LoadByNameN(self.js, "UInt32Property", 0,self.Data["date"][av[1]])-257)][0])
                        else:
                            print(self.LoadByNameN(self.js, "UInt32Property", 0,self.Data["date"][av[1]]))
                    except Exception as e:
                        pass
            elif command == "back":
                break
            elif command == "help":
                print("")
                print(f"back : to exit date editing\nprint : show editable value name\nedit 'value_name' : edit the value of 'value_name'\nget 'value_name' : get the value of 'value_name'")
    def Personas(self):
        personaid=[["( You'r Skill ID )",-1],["Io",1],["Isis",2],["Hermès",3],["Trismégiste",4],["Oni",60]]
        skillid=[["( You'r Skill ID )",-1],["Agi",10],["Nu",89]]
        skillname={-1:"( You'r Skill ID )",10:"Agi",89:"Nu"}
        while True:
            try:
                answer = input("Choose personas slot (1-6) (put nothing to cancel): ")
                answer = int(answer)
                if answer >= 1 and answer <= 6:
                    while True:
                        command=input(f"(type help to see comand) (Personas slot {answer} editing): ").lower()
                        if command == None:
                            pass
                        elif command == "edit persona":
                            while True:
                                counter=0
                                print("Choose new personas (put nothing to cancel):")
                                for i in personaid:
                                    counter+=1
                                    print(f"    {counter} : {i[0]}")
                                persona_answer=input("")
                                try:
                                    persona_answer=int(persona_answer)
                                    if persona_answer > 0 and persona_answer <= len(personaid) and personaid[persona_answer-1][1] != -1:
                                        personas_new_value = int.from_bytes(binascii.unhexlify((personaid[persona_answer-1][1]).to_bytes(2, byteorder='little').hex()+"01"),byteorder="big")
                                    elif persona_answer > 0 and persona_answer <= len(personaid):
                                        while True:
                                            persona_input_id = input("Persona ID (put nothing to cancle) (bad Persona ID could crash the game): ")
                                            try:
                                                persona_input_id = int(persona_input_id)
                                                if persona_input_id >= 0:
                                                    personas_new_value = int.from_bytes(binascii.unhexlify((persona_input_id).to_bytes(2, byteorder='little').hex()+"01"),byteorder="big")
                                                    break
                                            except:
                                                if persona_input_id == "":
                                                    break
                                    verify_bool=False
                                    for verify in self.Data["personavalueid"]["persona"]:
                                        if verify != self.Data["personavalueid"]["persona"][answer-1]:
                                            if self.LoadByNameN(self.js, "UInt32Property", 0,verify) == personas_new_value:
                                                verify_bool = True
                                    if verify_bool == False:
                                        self.js=self.SaveByNameN(self.js, "UInt32Property", 0, personas_new_value,self.Data["personavalueid"]["persona"][answer-1])
                                        break
                                    elif verify_bool == True:
                                        print("\n\nCan't have double persona")
                                except Exception as e:
                                    if persona_answer == "":
                                        break
                        elif command == "edit level":
                            while True:
                                new_level=input("Choose persona's level (99 max) (put nothing to cancel): ")
                                try:
                                    new_level=int(new_level)
                                    if new_level > 0 and new_level <= 99:
                                        self.js=self.SaveByNameN(self.js, "UInt32Property", 0, new_level,self.Data["personavalueid"]["level"][answer-1])
                                        break
                                except Exception as e:
                                    print(e)
                                    if new_level == "":
                                        break
                        elif command == "edit exp":
                            while True:
                                new_exp=input("Choose persona's exp (4294967295 max) (put nothing to cancel): ")
                                try:
                                    new_exp=int(new_exp)
                                    if new_exp > 0 and new_exp <= 4294967295:
                                        self.js=self.SaveByNameN(self.js, "UInt32Property", 0, new_exp,self.Data["personavalueid"]["exp"][answer-1])
                                        break
                                except:
                                    if new_exp == "":
                                        break
                        elif command == "edit skill":
                            skill_process=["skill_slot_1","skill_slot_2","skill_slot_3","skill_slot_4"]
                            skill_list=[]
                            try:
                                for skill_i in skill_process:
                                    if skill_i == "skill_slot_4":
                                        pass
                                    skill_tmp=self.LoadByNameN(self.js, "UInt32Property", 0,self.Data["personavalueid"][skill_i][answer-1])
                                    skill_tmp=binascii.hexlify(int.to_bytes(skill_tmp,4,byteorder="big")).decode()
                                    if skill_tmp[0:4] != "0000":
                                        skill_list.append(int(skill_tmp[0:4],16))
                                    if skill_tmp[4:len(skill_tmp)] != "0000":
                                        skill_list.append(int(skill_tmp[4:len(skill_tmp)],16))
                            except:
                                pass
                            while True:
                                print("Skills : (type ('add' to add skill and 'del 'numero'' to remove skill) (you can't add to an non-empty place)")
                                counter = 0
                                for iss in skill_list:
                                    counter+=1
                                    try:
                                        print(f"    {counter} : {skillname[iss]}")
                                    except:
                                        print(f"    {counter} : {iss}")
                                command2 = input("Add or Del skill: ")
                                try:
                                    if command2.split(" ")[0].lower() == "del":
                                        if len(command2.split(" ")) > 1:
                                            if int(command2.split(" ")[1]) > 0 and int(command2.split(" ")[1]) <= len(skill_list):
                                                counter2=0
                                                lenn=len(skill_list)
                                                for ibn in range(lenn):
                                                    counter2+=1
                                                    if counter2 == int(command2.split(" ")[1]):
                                                        del skill_list[ibn]
                                                        break
                                    elif command2 == "add" and len(skill_list) < 8:
                                        while True:
                                            counter2=0
                                            for ibn in skillid:
                                                counter2+=1
                                                print(f"    {counter2} : {ibn[0]}")
                                            skill2_answer=input()
                                            try:
                                                skill2_answer=int(skill2_answer)
                                                if skill2_answer > 0 and skill2_answer <= len(skillid):
                                                    if skillid[skill2_answer-1][1] > -1:
                                                        skill_list.append(skillid[skill2_answer-1][1])
                                                    else:
                                                        while True:
                                                            skill_input_id = input("Skill ID (put nothing to cancle) (bad Skill ID could crash the game): ")
                                                            try:
                                                                skill_input_id = int(skill_input_id)
                                                                if skill_input_id >= 0:
                                                                    skill_list.append(skill_input_id)
                                                                    break
                                                            except:
                                                                if skill_input_id == "":
                                                                    break
                                                    break
                                            except Exception as e:
                                                print(e)
                                                if skill2_answer == "":
                                                    break
                                    elif command2 == "":
                                        print(True)
                                        counter=0
                                        val1=""
                                        val2=""
                                        val3=""
                                        val4=""
                                        for iuio in skill_list:
                                            counter+=1
                                            if counter < 3:
                                                val1+=(iuio).to_bytes(2, byteorder='big').hex()
                                            elif counter < 5:
                                                val2+=(iuio).to_bytes(2, byteorder='big').hex()
                                            elif counter < 7:
                                                val3+=(iuio).to_bytes(2, byteorder='big').hex()
                                            else:
                                                val4+=(iuio).to_bytes(2, byteorder='big').hex()
                                            
                                        if val1 != "":
                                            self.js=self.SaveByNameN(self.js, "UInt32Property", 0, int(val1,16),self.Data["personavalueid"]["skill_slot_1"][answer-1])
                                        else:
                                            self.js=self.DelByNameN(self.js, "UInt32Property", 0,self.Data["personavalueid"]["skill_slot_1"][answer-1])
                                        if val2 != "":
                                            self.js=self.SaveByNameN(self.js, "UInt32Property", 0, int(val2,16),self.Data["personavalueid"]["skill_slot_2"][answer-1])
                                        else:
                                            self.js=self.DelByNameN(self.js, "UInt32Property", 0,self.Data["personavalueid"]["skill_slot_2"][answer-1])
                                        if val3 != "":
                                            self.js=self.SaveByNameN(self.js, "UInt32Property", 0, int(val3,16),self.Data["personavalueid"]["skill_slot_3"][answer-1])
                                        else:
                                            self.js=self.DelByNameN(self.js, "UInt32Property", 0,self.Data["personavalueid"]["skill_slot_3"][answer-1])
                                        if val4 != "":
                                            print(True)
                                            self.js=self.SaveByNameN(self.js, "UInt32Property", 0, int(val4,16),self.Data["personavalueid"]["skill_slot_4"][answer-1])
                                            print(False)
                                        else:
                                            self.js=self.DelByNameN(self.js, "UInt32Property", 0,self.Data["personavalueid"]["skill_slot_4"][answer-1])
                                        break
                                except:
                                    pass
                        elif command == "edit stats":
                            varr=["Fo","Ma","En","Ag","Ch"]
                            fomaenag = ""
                            ch = ""
                            for inns in varr:
                                while True:#_ch
                                    inputt=input(f"Set new {inns} (max 99): ")
                                    try:
                                        inputt=int(inputt)
                                        if inputt > 0 and inputt < 100:
                                            if inns == "Ch":
                                                ch = self.js=self.SaveByNameN(self.js, "UInt32Property", 0, inputt,self.Data["personavalueid"]["ch"][answer-1])
                                                break
                                            else:
                                                fomaenag+=(inputt).to_bytes(1, byteorder='little').hex()
                                                break
                                    except:
                                        pass
                            
                            self.js=self.SaveByNameN(self.js, "UInt32Property", 0, int.from_bytes(binascii.unhexlify(fomaenag),byteorder="big"),self.Data["personavalueid"]["fo_ma_en_ag"][answer-1])
                                            
                        elif command=="print":
                            print("")
                            stat_show = False
                            skill_show = False
                            for i in self.Data["personavalueid"].keys():
                                if (i == "fo_ma_en_ag" or i == "ch"):
                                    if (stat_show == False):
                                        print("stats")
                                        stat_show=True
                                elif ("skill_slot_" in i):
                                    if (skill_show == False):
                                        print("skill")
                                        skill_show = True
                                else:
                                    print(i)
                        elif command == "help":
                            print("")
                            print("back : to exit persona slot {answer} editing\nprint : show editable value\nedit 'value_name' : edit the value of 'value_name'")
                        elif command == "back":
                            break 
            except:
                if answer == "":
                    break
    
    def Money(self):
        while True:
            try:
                new_name=input("New Money (9999999 max | put nothing to cancel): ")
                new_name=int(new_name)
                if new_name>=0 and new_name<=9999999:
                    self.js=self.SaveByNameN(self.js, "UInt32Property", 0, new_name,7261)
                    self.Data["money"]=new_name
                    print(new_name)
                    break
            except:
                try:
                    if len(new_name)==0:
                        break
                except:
                    pass
if len(sys.argv) >1:
    try:
        a=sys.argv[1].replace('"',"")
        a=OpenSave().Load(os.path.split(os.path.abspath(a))[0],0,os.path.split(os.path.abspath(a))[1],True)
    except FileNotFoundError:
        raise FileNotFoundError("Bad path\n")
    except PermissionError:
        raise FileNotFoundError("Permission error or Bad path error\n")
    except Exception as e:
        if "Failed to read HeaderProperty" in str(e):
            raise Exception("Invalid file format (not persona 3 reload GVAS)")
else:
    while True:
        try:
            a=input("Persona3 Reload sav path : ").replace('"',"")
            a=OpenSave().Load(os.path.split(os.path.abspath(a))[0],0,os.path.split(os.path.abspath(a))[1],True)
        except FileNotFoundError:
            print("Bad path\n")
        except PermissionError:
            print("Permission error or Bad path error\n")
        except Exception as e:
            if "Failed to read HeaderProperty" in str(e):
                raise Exception("Invalid file format (not persona 3 reload GVAS)")
