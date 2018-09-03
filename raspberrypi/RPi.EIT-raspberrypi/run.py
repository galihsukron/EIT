#!/usr/bin/env python

from config import *
# from konekArduino.I2C import I2C
from API.PerangkatEIT import PerangkatEIT
from socketIO_client import SocketIO, LoggingNamespace

from random import uniform
import time

socketIO = SocketIO(host, port, LoggingNamespace)
EIT = PerangkatEIT(host, port, id_alat)
token = EIT.getToken()
# arduino = I2C(address)

def getData(*args):
	print(token)
	if args[0]["token"]==token:
		print("token cocok")
		dataVolt = []
		for i in range(208):
			dataVolt.append(uniform(0.001,0.05))
			time.sleep(0.02)
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
