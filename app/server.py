from flask import Flask, render_template
from xrpl.clients import JsonRpcClient
from xrpl.wallet import generate_faucet_wallet

class COLORS:
    RED = "\033[91m"
    GREEN = "\033[92m"
    VIOLET = "\033[95m"
    YELLOW = "\033[93m"
    GREY = "\033[90m"
    RESET = "\033[0m"

CURRENCY = "KWH"
LIMIT = 2000

client = JsonRpcClient("https://s.altnet.rippletest.net:51234/")
cold_wallet = generate_faucet_wallet(client, debug=True)
print(f"{COLORS.GREY}Created cold wallet with address: {cold_wallet.classic_address}{COLORS.RESET} and seed: {cold_wallet.seed}")
cold_wallet_address = "rJvbDGN6ZEKDrdpjYwFzRpu5HbVNATBbkV"



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
    return render_template('produce.html', cold_wallet_addres=cold_wallet.classic_address, cold_wallet_seed=cold_wallet.seed)

@app.route('/consumer/consume')
def consume():
    return render_template('consume.html', cold_wallet_address=cold_wallet.classic_address)
    # return render_template('consume.html', cold_wallet_address=cold_wallet_address)

@app.route('/balence')
def balence():
    return render_template('balence.html')

@app.route('/trustline')
def trustline():
    return render_template('trustline.html')


if __name__ == '__main__':
    app.run(debug=True)
    
    