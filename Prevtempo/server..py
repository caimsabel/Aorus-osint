from flask import Flask, jsonify, request
import requests
from flask_cors import CORS
import base64

app = Flask(__name__)
CORS(app)  # Libera acesso para o navegador

# SEU CLIENT ID E CLIENT SECRET AQUI
CLIENT_ID = 'LUkxM09hWHNNX21aZkpjdDRBVE86MTpjaQ'
CLIENT_SECRET = '-0CxP6NiJyvSOhq6HISuLxq9l2azdq73b5FQr64BNuu4PUN6cr'

# Variável global para armazenar o Bearer Token
bearer_token = None

# Função para obter Bearer Token
def pegar_bearer_token():
    global bearer_token
    auth = f"{CLIENT_ID}:{CLIENT_SECRET}"
    b64_auth = base64.b64encode(auth.encode()).decode()

    headers = {
        "Authorization": f"Basic {b64_auth}",
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
    }

    data = {
        "grant_type": "client_credentials"
    }

    r = requests.post("https://api.twitter.com/oauth2/token", headers=headers, data=data)
    resposta = r.json()
    bearer_token = resposta['access_token']
    print("Token OAuth obtido!")

# Pega o token uma vez antes de rodar
pegar_bearer_token()

# Rota para buscar tweets
@app.route('/tweets', methods=['GET'])
def buscar_tweets():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    palavras = "(fogo OR chuva OR seca OR incêndio)"

    url = f"https://api.twitter.com/2/tweets/search/recent?query={palavras} point_radius:[{lon} {lat} 10km]&tweet.fields=created_at,text"

    headers = {
        "Authorization": f"Bearer {bearer_token}"
    }

    resposta = requests.get(url, headers=headers)
    return jsonify(resposta.json())

if __name__ == '__main__':
    app.run(port=5000)
from flask import Flask, jsonify, request
import requests
from flask_cors import CORS
import base64

app = Flask(__name__)
CORS(app)  # Libera acesso para o navegador

# SEU CLIENT ID E CLIENT SECRET AQUI
CLIENT_ID = 'LUkxM09hWHNNX21aZkpjdDRBVE86MTpjaQ'
CLIENT_SECRET = '_e6A4V4GTpDxfbcDREFT8IWl3YpYAipRjrzm-MHiMBQ4kAw7U6'

# Variável global para armazenar o Bearer Token
bearer_token = None

# Função para obter Bearer Token
def pegar_bearer_token():
    global bearer_token
    auth = f"{CLIENT_ID}:{CLIENT_SECRET}"
    b64_auth = base64.b64encode(auth.encode()).decode()

    headers = {
        "Authorization": f"Basic {b64_auth}",
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
    }

    data = {
        "grant_type": "client_credentials"
    }

    r = requests.post("https://api.twitter.com/oauth2/token", headers=headers, data=data)
    resposta = r.json()
    bearer_token = resposta['access_token']
    print("Token OAuth obtido!")

# Pega o token uma vez antes de rodar
pegar_bearer_token()

# Rota para buscar tweets
@app.route('/tweets', methods=['GET'])
def buscar_tweets():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    palavras = "(fogo OR chuva OR seca OR incêndio)"

    url = f"https://api.twitter.com/2/tweets/search/recent?query={palavras} point_radius:[{lon} {lat} 10km]&tweet.fields=created_at,text"

    headers = {
        "Authorization": f"Bearer {bearer_token}"
    }

    resposta = requests.get(url, headers=headers)
    return jsonify(resposta.json())

if __name__ == '__main__':
    app.run(port=5000)

import subprocess
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/cameras', methods=['GET'])
def buscar_cameras():
    cidade = request.args.get('cidade')
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    comando = ['node', 'cam_scraper.js', 'BR', cidade, lat, lon]

    try:
        result = subprocess.run(comando, capture_output=True, text=True, timeout=90)
        saida = result.stdout.strip()
        return jsonify(eval(saida))
    except Exception as e:
        print("Erro ao executar o scraper:", e)
        return jsonify([]), 500
