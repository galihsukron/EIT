import time
from time import strftime
import smbus
from smbus2 import SMBusWrapper
import math

class I2C(object):
	def __init__(self, address):
		self.address = address
		self.bus = smbus.SMBus(1)

	def sendData(self, value):
		data = []
		loop = math.ceil(value/255)
		#print (loop)
		if loop:
			mod = value%255
			while loop:
				data.append(255)
				loop=loop-1
			data.append(mod)
		else:
			data.append(value)

		with SMBusWrapper(1) as bus:
		    print (data)
		    #bus.write_i2c_block_data(self.address, 0, data)

		return -1

	def readData(self):
		data = []
		jumlah = 0
		for i in range(0, 4):
			val = self.bus.read_byte(self.address)
			jumlah+=val
			data.append(val)
		data.append(jumlah)
		return jumlah

	def control(self,data):
		with SMBusWrapper(1) as bus:
		    print (data)
		    bus.write_i2c_block_data(self.address, 0, data)
		return -1