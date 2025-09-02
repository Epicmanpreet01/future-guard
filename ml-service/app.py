from fastapi import FastAPI
import uvicorn

from dotenv import dotenv_values

CONFIG = dotenv_values('.env')

app = FastAPI()

@app.get('/')
def root():
  return { 'success': True, 'message': "ml service root accessed", 'data':[] }

if __name__ == '__main__':
  uvicorn.run(app,host='127.0.0.1', port=int(CONFIG['ML_SERVICE_PORT']))