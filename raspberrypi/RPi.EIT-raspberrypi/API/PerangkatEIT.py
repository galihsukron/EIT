import requests
import json

class PerangkatEIT(object):
	def __init__(self, host, port, id_alat):
		super(PerangkatEIT, self).__init__()
		self.headers = {"Authorization": "coegsekali", "Content-Type": "application/json", "idalat": str(id_alat)}
		self.host = str(host)+":"+str(port)

	def getToken(self):
		url = self.host+'/perangkat'
		response = requests.get(url, headers=self.headers)
		for hasil in json.loads(response.text):
			token = hasil["token"]
		print("token:",token)
		return(token)
		
