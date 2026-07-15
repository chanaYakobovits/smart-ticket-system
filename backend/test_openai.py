import os
import ssl
import requests
from requests.adapters import HTTPAdapter
from urllib3.poolmanager import PoolManager
from dotenv import load_dotenv

load_dotenv()


class SSLAdapter(HTTPAdapter):
    def init_poolmanager(self, *args, **kwargs):
        ctx = ssl.create_default_context()
        ctx.verify_flags &= ~ssl.VERIFY_X509_STRICT
        kwargs["ssl_context"] = ctx
        return super().init_poolmanager(*args, **kwargs)


session = requests.Session()
session.mount("https://", SSLAdapter())

headers = {
    "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}"
}

response = session.get(
    "https://api.openai.com/v1/models",
    headers=headers,
    timeout=30
)

print(response.status_code)
print(response.text)

print("Key exists:", os.getenv("OPENAI_API_KEY") is not None)
print("Key length:", len(os.getenv("OPENAI_API_KEY") or ""))