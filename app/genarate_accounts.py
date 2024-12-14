from xrpl.clients import JsonRpcClient
from xrpl.wallet import generate_faucet_wallet

client = JsonRpcClient("https://s.altnet.rippletest.net:51234/")
wallet1 = generate_faucet_wallet(client, debug=True)
wallet2 = generate_faucet_wallet(client, debug=True)

print(f"Wallet-1 classic address: {wallet1.classic_address} seed : {wallet1.seed}")
print(f"Wallet-2 classic address: {wallet2.classic_address} seed : {wallet2.seed}")