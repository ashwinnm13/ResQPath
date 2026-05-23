from fastapi.testclient import TestClient
import main

client = TestClient(main.app)
resp = client.get('/incidents')
print(resp.status_code)
print(resp.text)
