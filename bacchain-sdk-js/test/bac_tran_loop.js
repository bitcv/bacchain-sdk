const bacchainjs = require("../src");
const chainId = "test";
const lcdUrl = "http://18.182.44.23:1317";
const bacchainSdk = bacchainjs.newBacchainSdk(lcdUrl, chainId)


const mnemonic = "jeans antenna lucky way advice inherit sunset wild shock motion primary transfer exit excite design hope stage critic flush sister spell broom coach zoo"
bacchainSdk.setBech32MainPrefix("bac")


//获取私钥
const accAddr = bacchainSdk.getAddress(mnemonic);
const ecpairPriv = bacchainSdk.getECPairPriv(mnemonic);

console.log(accAddr)
console.log(ecpairPriv.toString('hex'))




var  from_address =  "bac10tyhju9pfpfkt7hrd2zqr0vjn4k5sfrrhenf7v"
var  validator_address  = "bacvaloper10tyhju9pfpfkt7hrd2zqr0vjn4k5sfrrl5kav9"
var  validator_address2 = "bacvaloper1cq9ah9hjrcszqhjt4s77ajkchp4x2u2hmz5zlk"



sendTxLoop();
async function sendTxLoop () {
    var data = await  bacchainSdk.getAccounts(accAddr)
    console.log(data)
    var sequence = data.value.sequence
    var account_number =  data.value.account_number
    for(var i =0;i<10;i++){
        var txInfo = {
            type: "bacchain/MsgSend",
            from_address :from_address,
            to_address :"bac19qp38ktnphpy0v8883ht8yw56y70v788vgde9n",
            amountDenom: "ubcv",
            amount: 1000000,
            feeDenom: "nbac",
            fee: 2000000,
            gas: 2000000,
            memo: "hello,bac",
            account_number: account_number,
            sequence: sequence
        }

        console.log(txInfo)

        var  stdSignMsg = bacchainSdk.NewStdMsg(txInfo);
        var signedTx = bacchainSdk.sign(stdSignMsg, ecpairPriv);

        console.log('%j',signedTx)


        //发送交易
        var data = await bacchainSdk.broadcast(signedTx)
        console.log('%j',data)
        sequence = parseInt(sequence) + 1;
    }
}