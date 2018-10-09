#!/usr/bin/env python
print "pertama"
from config import *
from konekArduino.I2C import I2C
from API.PerangkatEIT import PerangkatEIT
from socketIO_client import SocketIO, LoggingNamespace
print "kedua"
from random import uniform
import time
print "ketiga"
socketIO = SocketIO(host, port, LoggingNamespace)
print "Host ", host
print "Port ", port
print "LoggingNamespace ", LoggingNamespace
print "id_alat ", id_alat
EIT = PerangkatEIT(host, port, id_alat)
token = EIT.getToken()
print "Token ", token
arduino = I2C(address)
print "arduino ", arduino

def getData(*args):
	print(token)
	if args[0]["token"]==token:
		print("token cocok")
		#print(address)
		a = I2C(address)
#		print "kirim data 1"
#		a.sendData(1)
		print "data yg diambil"
#		a.readData()
		dataVolt = a.readData()
#		for i in range(208):
#			dataVolt.append(uniform(0.001,0.05))
#			time.sleep(0.02)
		#print(dataVolt)
		socketIO.emit('postDataVoltage',{"status":True, "volt":dataVolt, "token":args[0]["webToken"]})
		print("finish")
	else:
		print("tokennya ga cocok")

# main function
if __name__ == '__main__':
	socketIO.emit('raspiConnect', {"status": True, "id_alat": id_alat, "token": token})
	print ("Listening server from raspi...")
	socketIO.on('getDataVoltage', getData)
	socketIO.wait()
