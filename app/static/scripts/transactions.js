

statusDiv = document.querySelector('.status');
trustline = document.querySelector('#trustline');
transaction = document.querySelector('#transaction');

statusDiv.style.display = 'none';
trustline.style.display = 'none';
transaction.style.display = 'none';

let receiverAddress;
let userAddress;
let userSeed;
let amount;

let client;

async function getClient(){
    if(client === undefined){
        client = new xrpl.Client("wss://s.altnet.rippletest.net:51233")
        await client.connect();
        console.log("Connected successfully");
    }
    return client;
}

async function verifyAccount(client, address) {
    try {
        const accountInfo = await client.request({
            command: 'account_info',
            account: address
        });
        return true;
    } catch (error) {
        if (error.data.error === 'actNotFound') {
            return false;
        } else {
            throw(error);
        }
    }
}

async function sendTransactionRequest(client, userSeed, receiverAddress, amount) {
    
    document.getElementById('transaction-status').innerText = 'Transaction: Sending...';
    
    const transactionSent = await issueTokens(await getClient(), userSeed, receiverAddress, amount);

    if (transactionSent) {
        document.getElementById('transaction-status').innerText = 'Transaction: Sent';
    } else {
        document.getElementById('transaction-status').innerText = 'Transaction: Failed';
    }
}

async function sendNewTrustlineRequest(client, userSeed, receiverAddress) {
    document.getElementById('trustline-status').innerText = 'Trustline: Creating...';

    const trustlineCreated = await createTrustline(client, userSeed, receiverAddress);

    if (trustlineCreated) {
        document.getElementById('trustline-status').innerText = 'Trustline: Created';
    } else {
        document.getElementById('trustline-status').innerText = 'Trustline: Failed';
    }
}

async function verifyTrustline(client, userAddress, receiverAddress){
    
}

document.getElementById('trustline-button').addEventListener('click', async function() {
    window.location.href = '/trustline';
    // await sendNewTrustlineRequest(await getClient(), userSeed, receiverAddress);
    transaction.style.display = 'block';
});

document.getElementById('transaction-button').addEventListener('click', async function() {
    console.log(amount);
    await sendTransactionRequest(await getClient(), userSeed, receiverAddress, amount);
});

async function processForm(_userAddress, _userSeed, _receiverAddress, _amount, trust_transfer = false, _receiverSeed = null){
    userAddress = _userAddress;
    userSeed = _userSeed;
    receiverAddress = _receiverAddress;
    amount = _amount

    statusDiv.style.display = 'block';
    trustline.style.display = 'block';
    document.getElementById('trustline-button').style.display = 'none';
    document.getElementById('trustline-status').innerText = 'Trustline: Verifying...';

    const trustlineExists = await checkTrustline(await getClient(), receiverAddress, userAddress);

    if (trustlineExists) {
        document.getElementById('trustline-status').innerText = 'Trustline: Exists';
        transaction.style.display = 'block';
        document.getElementById('transaction-button').style.display = 'none';
        await sendTransactionRequest(getClient(), userSeed, receiverAddress, amount);
    } else {
        if(trust_transfer){
            await sendNewTrustlineRequest(await getClient(), _receiverSeed, userAddress);
            transaction.style.display = 'block';
            document.getElementById('transaction-button').style.display = 'none';
            await sendTransactionRequest(getClient(), userSeed, receiverAddress, amount);
        } else {
            document.getElementById('trustline-status').innerText = 'Trustline: Does not exist';
            document.getElementById('trustline-button').style.display = 'block';
        }
        
    }
}

