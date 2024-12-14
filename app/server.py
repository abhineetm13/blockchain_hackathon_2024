from flask import Flask, render_template
from xrpl.clients import JsonRpcClient
from xrpl.wallet import generate_faucet_wallet
import os
import json

class COLORS:
    RED = "\033[91m"
    GREEN = "\033[92m"
    VIOLET = "\033[95m"
    YELLOW = "\033[93m"
    GREY = "\033[90m"
    RESET = "\033[0m"

CURRENCY = "KWH"
LIMIT = 2000

wallet_file_path = os.path.join(os.path.dirname(__file__), "cold_wallet.json")
def save_wallet_to_file(wallet, file_path):
    wallet_data = {
        "classic_address": wallet.classic_address,
        "seed": wallet.seed
    }
    with open(file_path, 'w') as f:
        json.dump(wallet_data, f)

client = JsonRpcClient("https://s.altnet.rippletest.net:51234/")

cold_wallet = None
if not os.path.exists(wallet_file_path) or os.stat(wallet_file_path).st_size == 0:
    cold_wallet = generate_faucet_wallet(client, debug=True)
    save_wallet_to_file(cold_wallet, wallet_file_path)
    print(f"{COLORS.GREY}Created cold wallet with address: {cold_wallet.classic_address}{COLORS.RESET} and seed: {cold_wallet.seed}")
else:
    with open(wallet_file_path, 'r') as f:
        wallet_data = json.load(f)
        cold_wallet = type('Wallet', (object,), wallet_data)
        print(f"{COLORS.GREY}Loaded cold wallet with address: {cold_wallet.classic_address}{COLORS.RESET} and seed: {cold_wallet.seed}")



app = Flask(__name__)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/producer/send')
@app.route('/consumer/send')
def send():
    return render_template('transaction.html')


@app.route('/producer/produce')
def produce():
    # print(f"{COLORS.GREEN}Cold wallet address: {cold_wallet.classic_address}{COLORS.RESET}")
    return render_template('produce.html', cold_wallet_address=cold_wallet.classic_address, cold_wallet_seed=cold_wallet.seed)

@app.route('/consumer/consume')
def consume():
    return render_template('consume.html', cold_wallet_address=cold_wallet.classic_address, cold_wallet_seed=cold_wallet.seed)
    # return render_template('consume.html', cold_wallet_address=cold_wallet_address)

@app.route('/balence')
def balence():
    return render_template('balence.html')

@app.route('/trustline')
def trustline():
    return render_template('trustline.html')


if __name__ == '__main__':
    app.run(debug=True)
    
    