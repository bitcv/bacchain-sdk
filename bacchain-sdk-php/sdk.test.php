<?php
namespace BACChain\SDK;

require_once __DIR__.'/vendor/autoload.php';

include_once("./BACChainSDK.php");
include_once("./BACWordList.php");
include_once("./CurlUtil.php");

$chainId = "test";
$lcdUrl = "http://127.0.0.1:1317";

global $mnemonic;
global $sdk;

$mnemonic = "jeans antenna lucky way advice inherit sunset wild shock motion primary transfer exit excite design hope stage critic flush sister spell broom coach zoo";

$sdk = new BACChainSDK($lcdUrl, $chainId);
//print_r($sdk->convertStringToBytes($mnemonic));

$worldlist = new BACWordList();
//echo "\n";



$base64 = $sdk->getPubKeyByMnemonic($mnemonic);
print_r($base64);
echo "\n";
$privateKey = $sdk->getPriKeyByMnemonic($mnemonic);
print_r($privateKey);
echo "\n";
$pubKey = $sdk->getPubKeyByPriKey($privateKey);
print_r($pubKey);
echo "\n";

//$sdk->setBech32MainPrefix("bac");

$addr = $sdk->getAddrByMnemonic($mnemonic);
print_r($addr);
echo "\n";


$addr = $sdk->getAddrByPriKey($privateKey);
print_r($addr);
echo "\n";

$addr = $sdk->getAddrByPubKey($pubKey);
print_r($addr);
echo "\n";

echo $sdk->generateRandomMnemonic();
echo "\n";

$priKey = $sdk->getECPairPrivBuffer($mnemonic);
echo bin2hex($priKey);
echo "\n";

// $balances = $sdk->getBalances($addr);
// print_r($balances);
// echo "\n";

// echo $sdk->getAccounts($addr);
// echo "\n";

// echo $sdk->getBcvSupply();
// echo "\n";

// echo $sdk->getDelegationsByAccAddr($addr);
// echo "\n";

// echo @$sdk->getValidators();
// echo "\n";

// print_r($sdk->getBlockByHeight(100));
// echo "\n";
$from_address = $addr;

// print_r(json_decode($sdk->getTxInfoByHash("EFBBD319198FC9A6C09843A237BA15C199F874CC943BED95ECE76A718541E9F6")));
// echo "\n";
$from_address =  "bac1elymaqejghddzgfxdzsys7hten4fkwkghlkjdk";

sendTx();

function sendTx () 
{
    global $sdk;
    global $addr;
    global $from_address;
    global $priKey;
    $data = $sdk->getAccounts($addr);
    $userObj = json_decode($data);

    //print_r($data);
    // $txInfo = array(
    //     "type"=> "bacchain/MsgSend",
    //     "from_address"=> $from_address,
    //     "to_address"=>"bac1anp8qzj4welr3ydqnfyhmnarxjwqk0vrhuca7n",
    //     "amount"=> 1,
    //     "feeDenom"=> "nbac",
    //     "fee"=> 2000000,
    //     "gas"=> 2000000,
    //     "memo"=> "hello,bac中国",
    //     "amountDenom"=> "nbac",
    //     "account_number"=> $userObj->value->account_number,
    //     "sequence"=> $userObj->value->sequence
    // );

    // $txInfo = array(
    //     "type"=> "bacchain/MsgBurnBcvToStake",
    //     "acc_address"=> $from_address,
    //     "amountDenom"=> "ubcv",
    //     "amount"=> 10000000,
    //     "feeDenom"=> "nbac",
    //     "fee"=> 2000000,
    //     "gas"=> 2000000,
    //     "memo"=> "123",
    //     "account_number"=> $userObj->value->account_number,
    //     "sequence"=> $userObj->value->sequence
    // );

    // $txInfo = array(
    //     "type"=> "bacchain/MsgBurnBcvToEnergy",
    //     "acc_address"=> $from_address,
    //     "amountDenom"=> "ubcv",
    //     "amount"=> 10000000,
    //     "feeDenom"=> "nbac",
    //     "gas"=> 20000000,
    //     "fee"=> 20000000,
    //     "memo"=> "123",
    //     "sequence"=> $userObj->value->sequence,
    //     "account_number"=> $userObj->value->account_number
    // );
    // $txInfo = array(
    //     "type"=> "bacchain/MsgSubmitProposal",
    //     "description"=> "提交提案测试介绍",
    //     "initialDepositAmount"=> 1000000,
    //     "initialDepositDenom"=> "ubcv",
    //     "proposal_type"=>"Text",
    //     "proposer"=>$from_address,
    //     "title"=>"测试提案",
    //     "feeDenom"=> "nbac",
    //     "fee"=> 2000000,
    //     "gas"=> 2000000,
    //     "memo"=> "提案测试备注",
    //     "sequence"=> $userObj->value->sequence,
    //     "account_number"=> $userObj->value->account_number
    // );

    // $txInfo = array(
    //     "type"=> "bacchain/MsgDeposit",
    //     "proposal_id"=> "1",
    //     "depositor"=> $from_address,
    //     "amount"=> "1000000000",
    //     "amountDenom"=>"ubcv",
    //     "title"=>"N提案充值",
    //     "feeDenom"=> "nbac",
    //     "fee"=> 2000000,
    //     "gas"=> 2000000,
    //     "memo"=> "N提案充值",
    //     "sequence"=> $userObj->value->sequence,
    //     "account_number"=> $userObj->value->account_number
    // );
    // var txInfo = {
    //     type: "bacchain/MsgVote",
    //     option: "Yes",
    //     proposal_id : "2",
    //     voter : from_address,
    //     title:"P提案投票",
    //     feeDenom: "nbac",
    //     fee: 2000000,
    //     gas: 2000000,
    //     memo: "P提案投票",
    //     account_number: data.value.account_number,
    //     sequence: data.value.sequence
    // }
    $txInfo = array(
        "type" => "bacchain/MsgVote",
        "option" => "No",
        "proposal_id" => "1",
        "voter" => $from_address,
        "title"=>"N提案投票",
        "feeDenom"=> "nbac",
        "fee"=> 2000000,
        "gas"=> 2000000,
        "memo"=> "N提案投票",
        "sequence"=> $userObj->value->sequence,
        "account_number"=> $userObj->value->account_number
    );

    // var txInfo = {
    //     type: "bacchain/MsgBurnBcvToEnergy",
    //     acc_address: from_address,
    //     amountDenom: "ubcv",
    //     amount: 100000,
    //     feeDenom: "nbac",
    //     fee: 2000000,
    //     gas: 2000000,
    //     memo: "123",
    //     account_number: data.value.account_number,
    //     sequence: data.value.sequence
    // }

    // $EDATA_RREX_APP_VOTE_ZHONG = 0x41;
    // $vdata = array(
    //   "p"=>"BIT",
    //   "v"=>25000
    // );

    // $txInfo = array(
    //     "type"=> "bacchain/MsgEdata",
    //     "account"=>$from_address,
    //     "utype"=> $EDATA_RREX_APP_VOTE_ZHONG,
    //     "data"=> json_encode($vdata),
    //     "feeDenom"=> "nbac",
    //     "fee"=> 100000000,
    //     "gas"=> 100000000,
    //     "memo"=> "ReptVote",
    //     "sequence"=> $userObj->value->sequence,
    //     "account_number"=> $userObj->value->account_number
    // );


    // $txInfo = array(
    //     "type"=> "bacchain/MsgIssueToken",
    //     "owner_address"=>$from_address,
    //     "outer_name"=> 'psdk',
    //     "supply_num"=> "1000",
    //     "margin_amount"=>"1000000000",
    //     "margin_denom"=>"ubcv", //only ubcv
    //     "precision"=>6,
    //     "website"=>"https://www.bitcv.net",
    //     "description"=>"https://www.bitcv.net",
    //     "feeDenom"=> "nbac",
    //     "fee"=> 100000000,
    //     "gas"=> 100000000,
    //     "memo"=> "PHP SDK测试",
    //     "sequence"=> $userObj->value->sequence,
    //      "account_number"=> $userObj->value->account_number
    // );

    // $txInfo = array(
    //     "type"=> "bacchain/MsgRedeem",
    //     "account"=>$from_address,
    //     "redeem_amount"=> '100000000',
    //     "redeem_inner_name"=> "psdk-615",
    //     "feeDenom"=> "nbac",
    //     "fee"=> 100000000,
    //     "gas"=> 100000000,
    //     "memo"=> "销毁100个",
    //     "sequence"=> $userObj->value->sequence,
    //     "account_number"=> $userObj->value->account_number
    // );
    // $txInfo = array(
    //     "type"=> "bacchain/MsgAddMargin",
    //     "account"=>$from_address,
    //     "inner_name"=> "psdk-615",
    //     "margin_amount"=> "100000000",
    //     "margin_denom"=>"ubcv", //only ubcv
    //     "feeDenom"=> "nbac",
    //     "fee"=> 100000000,
    //     "gas"=> 100000000,
    //     "memo"=> "增加保证金PHP",
    //     "sequence"=> $userObj->value->sequence,
    //     "account_number"=> $userObj->value->account_number
    // );
    print_r($txInfo);


    $stdSignMsg = $sdk->NewStdMsg($txInfo);
    
    //echo ($sdk->getJSONStr($stdSignMsg));
    //echo "\n";
    echo $sdk->getSignHash($stdSignMsg);
    echo "\n";

    $signedTx = $sdk->getSignature($stdSignMsg, bin2hex($priKey));
    print_r($signedTx);
    //发送交易
    $data = $sdk->broadcast($signedTx);
    print_r($data);
}

