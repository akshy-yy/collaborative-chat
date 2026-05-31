import urllib.request
resp = urllib.request.urlopen("http://localhost:8000/health")
print(resp.read().decode())
