#baru
import time
from time import strftime
import smbus
from smbus2 import SMBusWrapper
import math
import struct

class I2C(object):
	def __init__(self, address):
		self.address = address
		self.bus = smbus.SMBus(1)
		self.loop = 1


	def sendData(self, value):
		data = []
		loop = math.ceil(value/255)
		print (loop)
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
		    bus.write_i2c_block_data(self.address, 0, data)

		return -1

	def readData_bak(self):
		print "halooo ini budi"
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
		
	def getDataVoltInByte(self):
		return self.bus.read_i2c_block_data(self.address, 0);
		
	def getFloat(self, data):
		index = 0
		bytes = data[4*index:(index+1)*4]
		return struct.unpack('f', "".join(map(chr, bytes)))[0]
		
	def readData(self):
		while self.loop:
			try:
				x = self.bus.read_byte(self.address)
				time.sleep(0.2)
				
				if(x==1):
					print "Data pertama, PI menerima dari arduino: ", x
					self.bus.write_byte(self.address, x)
					time.sleep(0.2)
					
					data2 = self.bus.read_byte(self.address)
					time.sleep(0.2)
					print "Data kedua, PI menerima dari arduino: ", data2
					self.bus.write_byte(self.address, data2)
					
					dataVolt = []
					
					for i in range(0,data2):
						try:
							data_voltage = self.getDataVoltInByte()
							
							data_voltage_float = self.getFloat(data_voltage)
#							print(data_voltage_float)
							dataVolt.append(data_voltage_float)
							time.sleep(0.2)
							
						except:
							print "coba lagi"
							
					flag_finish = self.bus.read_byte(self.address)
					time.sleep(0.2)
					print "Data flag, PI menerima dari arduino: ", flag_finish
					self.bus.write_byte(self.address, flag_finish)
					time.sleep(0.2)
					
					self.loop = 0
					return dataVolt
					
				else:
					print "Tidak ada data yang diteroima, coba lagi"
					time.sleep(0.2)
			except:
				print "Terjadi kesalahan."
				time.sleep(0.2)
				self.loop = 0