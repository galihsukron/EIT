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


	def control(self,data):
		with SMBusWrapper(1) as bus:
			print (data)
			bus.write_i2c_block_data(self.address, 0, data)
		return -1
		
	def getDataVoltInByte(self):
		return self.bus.read_i2c_block_data(self.address, 0);
		
	def getFloat(self, data, index):
		bytes = data[4*index:(index+1)*4]
		return struct.unpack('f', "".join(map(chr, bytes)))[0]

	
	def getData(self, data_size):
		dataVolt = []
		i=0					
		while i < data_size:
			try:
				data_voltage = self.getDataVoltInByte()

				for n in range(0,8):
					dataVolt.append(self.getFloat(data_voltage, n))
					print("dataVolt.append")

				i+=8
				time.sleep(1)
				
			except Exception, e:
				print e
				raw_input("berhenti dulu lah")
				self.loop = 0
				
		return dataVolt
	
	def readData(self):
		while self.loop:
			try:
				canScan = self.bus.read_byte(self.address)
				time.sleep(0.2)
				
				if(canScan==1):
					print "Data pertama, PI menerima dari arduino utk mulai scanning: ", canScan
					self.bus.write_byte(self.address, canScan)
					
					#scanning disini
					data=2
					while data == 2:
						print("masih scanning")
						data = self.bus.read_byte(self.address)
						time.sleep(2)
					print "ALOHA"

					time.sleep(2)
					data_size = data
					time.sleep(0.2)
					print "Data kedua, PI menerima data size dari arduino: ", data_size
					self.bus.write_byte(self.address, data_size)
					
					dataVolt = self.getData(data_size)
					print "Pengambilan dataVolt sudah selesai "
					time.sleep(2)		
					flag_finish = self.bus.read_byte(self.address)
					time.sleep(0.2)
					print "Data flag, PI menerima dari arduino: ", flag_finish
					print "Data index: ", dataVolt
#					print "Data index ke-207: ", dataVolt[207]
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