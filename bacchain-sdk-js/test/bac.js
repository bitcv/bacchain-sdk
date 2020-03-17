const bacchainjs = require("../src");
const chainId = "test";
const lcdUrl = "http://127.0.0.1:1317";
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




// bacchainSdk.getBalances(accAddr).then(data => {
//     console.log("获取用户资产")
//     console.log(data)
// })
//
// bacchainSdk.getAccounts(accAddr).then(data => {
//     console.log("获取交易信息")
//     console.log(data)
// })
//
//
// bacchainSdk.getBcvSupply().then(data => {
//     console.log("获取BCV供给情况")
//     console.log(data)
// })
//
// bacchainSdk.getDelegationsByAccAddr(accAddr).then(data => {
//     console.log("根据accAddr获取所有委托")
//     console.log(data)
// })
//
// bacchainSdk.getDelegateValidatorByAccAddr(accAddr).then(data => {
//     console.log("根据accAddr获取委托的验证节点")
//     console.log(data)
// })
//
// bacchainSdk.getDelegationByAccAddrAndValAddr(accAddr,validator_address).then(data => {
//     console.log("根据accAddr和valAddr获取委托")
//     console.log(data)
// })
//
// bacchainSdk.getValidators().then(data => {
//     console.log("获取所有验证节点")
//     console.log(data)
// })
//
// bacchainSdk.getBlockByHeight(1).then(data => {
//     console.log("根据高度获取区块信息")
//     console.log(data)
// })
//
//
// bacchainSdk.getTxInfoByHash("BD9F4D3691C0C267042833E8A512D536DE472C32CBFAAB7B39FB98B164ED6B92").then(data => {
//     console.log("根据hash获取交易详情")
//     console.log(data)
// })




sendTx();

async function sendTx () {
    var data = await  bacchainSdk.getAccounts(accAddr)

    // var txInfo = {
    //     type: "bacchain/MsgSend",
    //     from_address :from_address,
    //     to_address :"bac19qp38ktnphpy0v8883ht8yw56y70v788vgde9n",
    //     amountDenom: "nbac",
    //     amount: 1,
    //     feeDenom: "nbac",
    //     fee: 2000000,
    //     gas: 2000000,
    //     memo: "hello,bac",
    //     account_number: data.value.account_number,
    //     sequence: data.value.sequence
    // }

    //发交易
    // var txInfo = {
    //     type: "bacchain/MsgMultiSend",
    //     Input: [{address:address,coins:[{denom:"ubcv",amount:"10"}]},{address:"bac13vgrgulta724yxrdjhgtwc0yrud8jlt68y2dwg",coins:[{denom:"ubcv",amount:"30"}]}],
    //     Output:[{address:"bac13vgrgulta724yxrdjhgtwc0yrud8jlt68y2dwg",coins:[{denom:"ubcv",amount:"30"}]},{address:"bac13vgrgulta724yxrdjhgtwc0yrud8jlt68y2dwg",coins:[{denom:"ubcv",amount:"10"}]}],
    //     amountDenom: "nbac",
    //     amount: 1,
    //     feeDenom: "nbac",
    //     fee: 2000000,
    //     gas: 2000000,
    //     memo: "",
    //     account_number: data.value.account_number,
    //     sequence: data.value.sequence
    // }

    // //burn-bcv-to-bcvstake
    // var txInfo = {
    //     type: "bacchain/MsgBurnBcvToStake",
    //     acc_address: accAddr,
    //     amountDenom: "ubcv",
    //     amount: 1000000,
    //     feeDenom: "nbac",
    //     fee: 2000000,
    //     gas: 2000000,
    //     memo: "123",
    //     account_number: data.value.account_number,
    //     sequence: data.value.sequence
    // }


    //// burn-bcv-to-energy
    // var txInfo = {
    //     type: "bacchain/MsgBurnBcvToEnergy",
    //     acc_address: accAddr,
    //     amountDenom: "ubcv",
    //     amount: 100000,
    //     feeDenom: "nbac",
    //     fee: 2000000,
    //     gas: 2000000,
    //     memo: "123",
    //     account_number: data.value.account_number,
    //     sequence: data.value.sequence
    // }


    //MsgDelegate
    // var txInfo = {
    //         type: "bacchain/MsgDelegate",
    //         delegator_address: from_address,
    //         validator_address:validator_address,
    //         amountDenom: "ubcvstake",
    //         amount: 1300129,
    //         feeDenom: "nbac",
    //         fee: 2000000,
    //         gas: 2000000,
    //         memo: "",
    //         account_number: data.value.account_number,
    //         sequence: data.value.sequence
    // }


    //MsgBeginRedelegate
    // var txInfo = {
    //         type: "bacchain/MsgBeginRedelegate",
    //         delegator_address: from_address,
    //         validator_src_address:validator_address,
    //         validator_dst_address:validator_address2,
    //         amountDenom: "ubcvstake",
    //         amount: 1,
    //         feeDenom: "nbac",
    //         fee: 2000000,
    //         gas: 2000000,
    //         memo: "",
    //         account_number: data.value.account_number,
    //         sequence: data.value.sequence
    // }


    // //MsgSubmitProposal
    // var txInfo = {
    //         type: "bacchain/MsgSubmitProposal",
    //         description: "11111111111111",
    //         initialDepositAmount : "123",
    //         initialDepositDenom : "ubcv",
    //         proposal_type:"Text",
    //         proposer:from_address,
    //         title:"1234",
    //         feeDenom: "nbac",
    //         fee: 2000000,
    //         gas: 2000000,
    //         memo: "",
    //         account_number: data.value.account_number,
    //         sequence: data.value.sequence
    // }



    //MsgVote
    // var txInfo = {
    //     type: "bacchain/MsgVote",
    //     option: "Yes",
    //     proposal_id : "1",
    //     voter : from_address,
    //     title:"1234",
    //     feeDenom: "nbac",
    //     fee: 2000000,
    //     gas: 2000000,
    //     memo: "",
    //     account_number: data.value.account_number,
    //     sequence: data.value.sequence
    // }


    // var txInfo = {
    //     type: "bacchain/MsgWithdrawDelegationReward",
    //     delegator_address: from_address,
    //     validator_address:validator_address,
    //     feeDenom: "nbac",
    //     fee: 2000000,
    //     gas: 2000000,
    //     memo: "",
    //     account_number: data.value.account_number,
    //     sequence: data.value.sequence
    // }


    var txInfo = {
        type: "bacchain/MsgWithdrawValidatorCommission",
        validator_address:validator_address,
        feeDenom: "nbac",
        fee: 2000000,
        gas: 2000000,
        memo: "",
        account_number: data.value.account_number,
        sequence: data.value.sequence
    }


    var  stdSignMsg = bacchainSdk.NewStdMsg(txInfo);
    var signedTx = bacchainSdk.sign(stdSignMsg, ecpairPriv);

    console.log('%j',signedTx)


    //发送交易
    var data = await bacchainSdk.broadcast(signedTx)
    console.log('%j',data)
}


function sleep(delay) {
    var start = (new Date()).getTime();
    while ((new Date()).getTime() - start < delay) {
        continue;
    }
}

