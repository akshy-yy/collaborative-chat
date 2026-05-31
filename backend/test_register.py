import urllib.request, json

data = json.dumps({
    "email": "test@test.com",
    "password": "test123",
    "display_name": "Test User"
}).encode()

req = urllib.request.Request(
    "http://localhost:8000/api/auth/register",
    data=data,
    headers={"Content-Type": "application/json"},
    method="POST"
)
try:
    resp = urllib.request.urlopen(req)
    print("SUCCESS:", resp.read().decode())
except urllib.error.HTTPError as e:
    print("HTTP ERROR:", e.code, e.read().decode())
except Exception as e:
    print("ERROR:", e)
