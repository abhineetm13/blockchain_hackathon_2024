async function createTrustline(client, seed, issuer, currency = "KWH", limit = 2000) {
    const wallet = xrpl.Wallet.fromSeed(seed);

    const trustSetTx = {
        TransactionType: "TrustSet",
        Account: wallet.address,
        LimitAmount: {
            currency: currency,
            issuer: issuer,
            value: limit.toString(),
        },
    };

    const preparedTx = await client.autofill(trustSetTx);
    const signedTx = wallet.sign(preparedTx);
    const tx_result = await client.submitAndWait(signedTx.tx_blob);
    console.log("Trustline Created:", tx_result);

    return tx_result.result.validated;
}

async function checkTrustline(client, consumerAddress, producerAddress, limit = 2000) {
    try {
        // Request the account lines (trust lines) for the consumer
        console.log("Checking trustline between", consumerAddress, "and", producerAddress);
        const response = await client.request({
            command: "account_lines",
            account: producerAddress,
            ledger_index: "validated"
        });
        const consumer_res = await client.request({
            command: "account_lines",
            account: consumerAddress,
            ledger_index: "validated"
        });
        console.log("Trustlines of consumer:", consumer_res.result)
        console.log("Trustlines of producer:", response.result)

        // Iterate through the trust lines
        for (const line of response.result.lines) {
            if (line.account === consumerAddress && line.limit_peer >= limit) {
                return true;  // Trust line exists
            }
        }
        return false;  // No matching trust line
    } catch (error) {
        console.error("Error checking trustline:", error);
        return false;  // If there's an error, assume no trustline exists
    }
}

async function getBalance(client, address) {
    try {
        const accountInfo = await client.request({
            command: 'account_lines',
            account: address,
            ledger_index: 'validated'
        });
        console.log("account Info:", accountInfo.result);
        return accountInfo.result.lines.reduce((total, obj) => total + parseInt(obj.balance), 0);
    } catch (error) {
        console.error("Error getting balance:", error);
        return 0;
    }
}


async function issueTokens(client, seed, destination, amount, currency = "KWH") {
    const wallet = xrpl.Wallet.fromSeed(seed);

    console.log("amount to be sent:", amount);
    const paymentTx = {
        TransactionType: "Payment",
        Account: wallet.address,
        Destination: destination,
        Amount: {
            currency: currency,
            value: amount.toString(),
            issuer: wallet.address,
        },
    };

    const preparedTx = await client.autofill(paymentTx);
    const signedTx = wallet.sign(preparedTx);
    const result = await client.submitAndWait(signedTx.tx_blob);
    console.log("Tokens Issued:", result);
    return result.result.validated;
}