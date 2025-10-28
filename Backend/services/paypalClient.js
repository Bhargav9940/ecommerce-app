const checkoutSDK = require('@paypal/checkout-server-sdk');

function environment() {
    let clientId = process.env.PAYPAL_CLIENT_ID;
    let clientSecret = process.env.PAYPAL_SECRET;
    
    return new checkoutSDK.core.SandboxEnvironment(
        clientId,
        clientSecret
    );
}

function client() {
    return new checkoutSDK.core.PayPalHttpClient(environment());
}

module.exports = { client };