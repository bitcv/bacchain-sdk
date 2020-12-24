<?php

namespace BACChain\SDK;

use BitWasp\Bitcoin\Address\Bech32AddressInterface;
use BitWasp\Bitcoin\Crypto\EcAdapter\Key\PrivateKeyInterface;
use BitWasp\Bitcoin\Mnemonic\Bip39\Bip39Mnemonic;
use BitWasp\Bitcoin\Mnemonic\Bip39\Bip39SeedGenerator;
use BitWasp\Bitcoin\Key\Factory\HierarchicalKeyFactory;
use BitWasp\Bitcoin\Crypto\EcAdapter\Impl\Secp256k1\Adapter\EcAdapter;
use BitWasp\Bitcoin\Bitcoin;
use BitWasp\Bitcoin\Address\AddressCreator;
use BitWasp\Bitcoin\Address\PayToPubKeyHashAddress;

use Error;
use BitWasp\BitcoinLib\BIP32;
use BitWasp\BitcoinLib\BIP39\BIP39 as BIP39BIP39;
use Generator;
use BitWasp\Buffertools\Buffer;
use BitWasp\Bitcoin\Crypto\Hash;


use function BitWasp\Bech32\convertBits;
use function BitWasp\Bech32\encode;


class BACChainSDK
{
    private static $_BacChainSDK;
    private $url;
    private $chainId;
    private $path;
    private  $bech32MainPrefix;

    const API_GET_ACCOUNTS = "/auth/accounts";
    const API_GET_BALANCES = "/bank/balances";
    const API_GET_SUPPLY_BCV = "/bank/supply/bcv";
    const API_GET_BLOCKS = "/blocks";
    const API_GET_DELEGATORS = "/staking/delegators";
    const API_GET_VALIDATORS = "/staking/validators";
    const API_GET_TXS = "/txs";
    const API_GET_LATEST = "/blocks/latest";
    const API_PATH_DELEGATIONS = "/delegations";
    const API_PATH_VALIDATORS = "/validators";
    const API_MSG_ADD_MARGIN = "bacchain/MsgAddMargin";
    const API_MSG_BEGIN_REDELEGATE = "bacchain/MsgBeginRedelegate";
    const API_MSG_BURN_BCV_TO_ENERGY = "bacchain/MsgBurnBcvToEnergy";
    const API_MSG_BURN_BCV_TO_STAKE = "bacchain/MsgBurnBcvToStake";
    const API_MSG_DELEGATE = "bacchain/MsgDelegate";
    const API_MSG_DEPOSIT = "bacchain/MsgDeposit";
    const API_MSG_EDATA = "bacchain/MsgEdata";
    const API_MSG_EDIT_VALIDATOR = "bacchain/MsgEditValidator";
    const API_MSG_ISSUE_TOKEN = "bacchain/MsgIssueToken";
    const API_MSG_MODIFY_WITHDRAW_ADDRESS = "bacchain/MsgModifyWithdrawAddress";
    const API_MSG_MULTI_SEND = "bacchain/MsgMultiSend";
    const API_MSG_REDEEM = "bacchain/MsgRedeem";
    const API_MSG_SEND = "bacchain/MsgSend";
    const API_MSG_SUBMIT_PROPOSAL = "bacchain/MsgSubmitProposal";
    const API_MSG_UNDELEGATE = "bacchain/MsgUndelegate";
    const API_MSG_VOTE = "bacchain/MsgVote";
    const API_MSG_WITHDRAW_DELEGATION_REWARD = "bacchain/MsgWithdrawDelegationReward";
    const API_MSG_WITHDRAW_VALIDATOR_COMMISSION = "bacchain/MsgWithdrawValidatorCommission";

    function __construct($url, $chainId)
    {
        $this->url = $url;
        $this->chainId = $chainId;
        //$this->path = "m/44'/572'/0'/0/0";
        $this->path = "44'/572'/0'/0/0";
        $this->bech32MainPrefix = "bac";
        if (!$this->url) {
            throw new Error("url object was not set or invalid");
        }
        if (!$this->chainId) {
            throw new Error("chainId object was not set or invalid");
        }
    }

    public function setBech32MainPrefix($bech32MainPrefix)
    {
        $this->bech32MainPrefix = $bech32MainPrefix;

        if (!$this->bech32MainPrefix) {
            throw new Error("bech32MainPrefix object was not set or invalid");
        }
    }

    public function setPath($path)
    {
        $this->path = $path;

        if (!$this->path) {
            throw new Error("path object was not set or invalid");
        }
    }

    public static function getInstance($url, $chainId)
    {
        if (!self::$_BacChainSDK) {
            self::$_BacChainSDK = new BACChainSDK($url, $chainId);
        }
        return self::$_BacChainSDK;
    }
    public function convertStringToBytes($str)
    {
        if (gettype($str) !== "string") {
            throw new Error("str expects a string");
        }
        $myBuffer = unpack("C*", $str);
        return $myBuffer;
    }

    public function getECPairPriv($mnemonic): PrivateKeyInterface
    {
        if (gettype($mnemonic) !== "string") {
            throw new Error("mnemonic expects a string");
        }
        $generator = new Bip39SeedGenerator();
        $seed = $generator->getSeed($mnemonic);

        // echo $seed->getHex() . "\n";

        $hdFactory = new HierarchicalKeyFactory();
        $bip32 = $hdFactory->fromEntropy($seed);

        $path = $bip32->derivePath($this->path);
        return $path->getPrivateKey();
    }

    public function getECPairPrivBuffer($mnemonic)
    {
        $priKey = $this->getECPairPriv($mnemonic);
        return $priKey->getBuffer()->getBinary();
    }

    public function getPubKeyBase64(PrivateKeyInterface $privateKey)
    {
        $publicKey = $privateKey->getPublicKey();
        $buffer = $publicKey->getBuffer();
        return base64_encode($buffer->getBinary());
    }

    public function getPriKeyByMnemonic($mnemonic)
    {
        $priKeyStr = $this->getECPairPrivBuffer($mnemonic);
        return bin2hex($priKeyStr);
    }
    public function getPubKeyByMnemonic($mnemonic)
    {
        return $this->getPubKeyBase64($this->getECPairPriv($mnemonic));
    }

    public function getPubKeyByPriKey($priKey)
    {
        $adapter = Bitcoin::getEcAdapter();
        $gmp = gmp_init("0x" . $priKey);
        $privateKey = $adapter->getPrivateKey($gmp, true);
        return $this->getPubKeyBase64($privateKey);
    }

    public function getAddrByMnemonic($mnemonic)
    {
        if (gettype($mnemonic) !== "string") {
            throw new Error("mnemonic expects a string");
        }
        $generator = new Bip39SeedGenerator();
        $seed = $generator->getSeed($mnemonic);

        $hdFactory = new HierarchicalKeyFactory();
        $bip32 = $hdFactory->fromEntropy($seed);

        $path = $bip32->derivePath($this->path);

        $priKey = $path->getPrivateKey();

        $pubKey =  $priKey->getPublicKey();

        $hash160 = Hash::sha256ripe160($pubKey->getBuffer());


        $encodeData = array_values(unpack('C*', $hash160->getBinary())); //$priKey->getBuffer()->getBinary()));

        $data = convertBits($encodeData, count($encodeData), 8, 5, true);

        return encode($this->bech32MainPrefix, $data);
    }

    public function getAddrByPriKey($priKey)
    {
        $adapter = Bitcoin::getEcAdapter();

        $gmp = gmp_init("0x" . $priKey);
        $privateKey = $adapter->getPrivateKey($gmp, true);
        $publicKey = $privateKey->getPublicKey();

        $hash160 = Hash::sha256ripe160($publicKey->getBuffer());

        $encodeData = array_values(unpack('C*', $hash160->getBinary())); //$priKey->getBuffer()->getBinary()));

        $data = convertBits($encodeData, count($encodeData), 8, 5, true);

        return encode($this->bech32MainPrefix, $data);
    }

    public function getAddrByPubKey($pubKey)
    {
        $buffer =  base64_decode($pubKey);
        $buffer = (unpack("H*", $buffer))[1];

        $hash160 = Hash::sha256ripe160(Buffer::hex($buffer));

        $encodeData = array_values(unpack('C*', $hash160->getBinary())); //$priKey->getBuffer()->getBinary()));

        $data = convertBits($encodeData, count($encodeData), 8, 5, true);

        return encode($this->bech32MainPrefix, $data);
    }

    function generateRandomMnemonic()
    {
        $adapter = Bitcoin::getEcAdapter();
        $wordlist = new BACWordList();
        $handle = new Bip39Mnemonic($adapter, $wordlist);

        return $handle->create(256); //bip39.generateMnemonic(256);
    }

    public function getAccounts($address)
    {
        $accountsApi = self::API_GET_ACCOUNTS . "/";
        $url =  $this->url . $accountsApi . $address;
        $result = CurlUtil::callOnce($url, null, "get");
        return $result;
    }
    public function NewStdMsg($input)
    {
        $msg = array();
        switch ($input["type"]) {
            case self::API_MSG_SEND:
                $msg["msgs"] = array(
                    array(
                        "type" => $input["type"],
                        "value" => array(
                            "amount" => array(
                                array(
                                    "amount" => strval($input["amount"]),
                                    "denom" => $input["amountDenom"]
                                )
                            ),
                            "to_address" => $input["to_address"],
                            "from_address" => $input["from_address"]
                        )
                    )
                );
                break;
            case self::API_MSG_MULTI_SEND:
                $msg["msgs"] = array(
                    array(
                        "type" => $input["type"],
                        "value" => array(
                            "inputs" => $input["Input"],
                            "outputs" => $input["Output"]
                        )
                    )
                );
            case self::API_MSG_DELEGATE:
                $msg["msgs"] = array(
                    array(
                        "type" => $input["type"],
                        "value" => array(
                            "amount" => array(
                                "amount" => strval($input["amount"]),
                                "denom" => $input["amountDenom"]
                            ),
                            "delegator_address" => $input["delegator_address"],
                            "validator_address" => $input["validator_address"]
                        )
                    )
                );
                break;
            case self::API_MSG_UNDELEGATE:
                $msg["msgs"] = array(
                    array(
                        "type" => $input["type"],
                        "value" => array(
                            "amount" => array(
                                "amount" => strval($input["amount"]),
                                "denom" => $input["amountDenom"]
                            ),
                            "delegator_address" => $input["delegator_address"],
                            "validator_address" => $input["validator_address"]
                        )
                    )
                );
                break;
            case self::API_MSG_WITHDRAW_DELEGATION_REWARD:
                $msg["msgs"] = array(
                    array(
                        "type" => $input["type"],
                        "value" => array(
                            "delegator_address" => $input["delegator_address"],
                            "validator_address" => $input["validator_address"]
                        )
                    )
                );
                break;
            case self::API_MSG_WITHDRAW_VALIDATOR_COMMISSION:
                $msg["msgs"] = array(
                    array(
                        "type" => $input["type"],
                        "value" => array(
                            "validator_address" => $input["validator_address"]
                        )
                    )
                );
                break;
            case self::API_MSG_SUBMIT_PROPOSAL:
                $msg["msgs"] = array(
                    array(
                        "type" => $input["type"],
                        "value" => array(
                            "description" => $input["description"],
                            "initial_deposit" => array(
                                array(
                                    "amount" => strval($input["initialDepositAmount"]),
                                    "denom" => $input["initialDepositDenom"]
                                )
                            ),
                            "proposal_type" => $input["proposal_type"],
                            "proposer" => $input["proposer"],
                            "title" => $input["title"]
                        )
                    )
                );
                break;
            case self::API_MSG_DEPOSIT:
                $msg["msgs"] = array(
                    array(
                        "type" => $input["type"],
                        "value" => array(
                            "amount" => array(
                                array(
                                    "amount" => strval($input["amount"]),
                                    "denom" => $input["amountDenom"]
                                )
                            ),
                            "depositor" => $input["depositor"],
                            "proposal_id" => $input["proposal_id"]
                        )
                    )
                );
                break;
            case self::API_MSG_VOTE:
                $msg["msgs"] = array(
                    array(
                        "type" => $input["type"],
                        "value" => array(
                            "voter" => $input["voter"],
                            "option" => $input["option"],
                            "proposal_id" => $input["proposal_id"]
                        )
                    )
                );
                break;
            case self::API_MSG_BEGIN_REDELEGATE:
                $msg["msgs"] = array(
                    array(
                        "type" => $input["type"],
                        "value" => array(
                            "amount" => array(
                                "amount" => strval($input["amount"]),
                                "denom" => $input["amountDenom"]
                            ),
                            "delegator_address" => $input["delegator_address"],
                            "validator_dst_address" => $input["validator_dst_address"],
                            "validator_src_address" => $input["validator_src_address"]
                        )
                    )
                );
                break;
            case self::API_MSG_MODIFY_WITHDRAW_ADDRESS:
                $msg["msgs"] = array(
                    array(
                        "type" => $input["type"],
                        "value" => array(
                            "delegator_address" => $input["delegator_address"],
                            "withdraw_address" => $input["withdraw_address"]
                        )
                    )
                );
                break;
            case self::API_MSG_BURN_BCV_TO_STAKE:
                $msg["msgs"] = array(
                    array(
                        "type" => $input["type"],
                        "value" => array(
                            "amount" => array(
                                "amount" => strval($input["amount"]),
                                "denom" => $input["amountDenom"]
                            ),
                            "acc_address" => $input["acc_address"]
                        )
                    )
                );
                break;
            case self::API_MSG_BURN_BCV_TO_ENERGY:
                $msg["msgs"] = array(
                    array(
                        "type" => $input["type"],
                        "value" => array(
                            "amount" => array(
                                "amount" => strval($input["amount"]),
                                "denom" => $input["amountDenom"]
                            ),
                            "acc_address" => $input["acc_address"]
                        )
                    )
                );
                break;
            case self::API_MSG_EDIT_VALIDATOR:
                $msg["msgs"] = array(
                    array(
                        "type" => $input["type"],
                        "value" => array(
                            "Description" => array(
                                "moniker" => "[do-not-modify]",
                                "identity" => "[do-not-modify]",
                                "website" => "[do-not-modify]",
                                "details" => "[do-not-modify]"
                            ),
                            "address" => $input["address"],
                            "commission_rate" => strval($input["commission_rate"]),
                            "min_self_delegation" => null
                        )
                    )
                );
                break;
            case self::API_MSG_EDATA:
                $msg["msgs"] = array(
                    array(
                        "type" => $input["type"],
                        "value" => array(
                            "account" => $input["account"],
                            "utype" => $input["utype"],
                            "data" => $input["data"]
                        )
                    )
                );
                break;
            case self::API_MSG_ISSUE_TOKEN:
                $msg["msgs"] = array(
                    array(
                        "type" => $input["type"],
                        "value" => array(
                            "owner_address" => $input["owner_address"],
                            "outer_name" => $input["outer_name"],
                            "supply_num" => $input["supply_num"],
                            "margin" => array(
                                "amount" => strval($input["margin_amount"]),
                                "denom" => $input["margin_denom"]
                            ),
                            "precision" => $input["precision"],
                            "website" => $input["website"],
                            "description" => $input["description"],
                        )
                    )
                );
                break;
            case self::API_MSG_REDEEM:
                $msg["msgs"] = array(
                    array(
                        "type" => $input["type"],
                        "value" => array(
                            "account" => $input["account"],
                            "amount" => array(
                                "amount" => strval($input["redeem_amount"]),
                                "denom" => $input["redeem_inner_name"]
                            ),
                        )
                    )
                );
                break;
            case self::API_MSG_ADD_MARGIN:
                $msg["msgs"] = array(
                    array(
                        "type" => $input["type"],
                        "value" => array(
                            "account" => $input["account"],
                            "inner_name" => $input["inner_name"],
                            "amount" => array(
                                "amount" => strval($input["margin_amount"]),
                                "denom" => $input["margin_denom"]
                            ),
                        )
                    )
                );
                break;
            default:
                throw new Error("error type " . $input["type"]);
        }
        $msg["sequence"] = strval($input['sequence']);
        $msg["account_number"] = strval($input["account_number"]);
        $msg["chain_id"] = $this->chainId;
        $msg["memo"] = $input["memo"];
        $msg["fee"] = array(
            "amount" => array(
                array(
                    "amount" => strval($input["fee"]),
                    "denom" => $input["feeDenom"]
                )
            ),
            "gas" => strval($input["gas"])
        );
        BACChainSDK::sortObject($msg);
        $ret = array(
            "json" => $msg,
            "bytes" => $this->convertStringToBytes(json_encode($msg, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE))
        );
        return $ret;
    }

    static function sortObject(&$array)
    {
        foreach ($array as &$value) {
            if (is_array($value)) BACChainSDK::sortObject($value);
        }
        return ksort($array);
    }

    public function sign($stdSignMsg, $priKey)
    {
        $this->getSignature($stdSignMsg, $priKey, "sync");
    }
    public function getJSONStr($stdSignMsg)
    {
        $json = $stdSignMsg["json"];
        self::sortObject($json);
        return json_encode($json, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    public function getSignHash($stdSignMsg)
    {
        $json_str = $this->getJSONStr($stdSignMsg);
        $hash = hash("sha256", $json_str, true);
        return bin2hex($hash);
    }
    public function getSignature($stdSignMsg, $priKey, $modeType = "sync")
    {
        $hash = $this->getSignHash($stdSignMsg);

        $adapter = Bitcoin::getEcAdapter();

        $gmp = gmp_init("0x" . $priKey);
        $privateKey = $adapter->getPrivateKey($gmp, true);
   
        $signature =  $privateKey->sign(Buffer::hex($hash));
        $r = gmp_strval($signature->getR(), 16);
        $r = str_pad($r, 64, '0', STR_PAD_LEFT);
        $s = gmp_strval($signature->getS(), 16);
        $s = str_pad($s, 64, '0', STR_PAD_LEFT);
        $signatureBase64 = base64_encode(hex2bin($r . $s));
        
        echo $signatureBase64 . "\n";
        $signedTx = array(
            "tx" => array(
                "msg" => $stdSignMsg["json"]["msgs"],
                "fee" => $stdSignMsg["json"]["fee"],
                "signatures" => array(
                    array(
                        "signature" => $signatureBase64,
                        "pub_key" => array(
                            "type" => "tendermint/PubKeySecp256k1",
                            "value" => $this->getPubKeyBase64($privateKey)
                        )
                    )
                ),
                "memo" => $stdSignMsg["json"]["memo"]
            ),
            "mode" => $modeType
        );
        return json_encode($signedTx, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }
    

    public function broadcast($signTx)
    {
        $url = $this->url . (self::API_GET_TXS);
        return CurlUtil::callOnce(
            $url,
            $signTx,
            "post",
            false,
            CurlUtil::CURL_TIMEOUT,
            array("Content-Type" => "application/json")
        );
    }
 

    public function getTxInfoByHash($hash)
    {
        return CurlUtil::callOnce($this->url . self::API_GET_TXS . "/" . $hash, null, "get");;
    }

    public function getBalances($addr)
    {
        return CurlUtil::callOnce($this->url . self::API_GET_BALANCES . "/" . $addr, null, "get");
    }

    public function getBcvSupply()
    {
        return CurlUtil::callOnce($this->url . self::API_GET_SUPPLY_BCV, null, "get");
    }

    public function getDelegationsByAccAddr($addr)
    {
        return CurlUtil::callOnce($this->url . self::API_GET_DELEGATORS . "/" . $addr . self::API_PATH_DELEGATIONS, null, "get");
    }

    public function getDelegateValidatorByAccAddr($accAddr)
    {
        return CurlUtil::callOnce($this->url .  self::API_GET_DELEGATORS . "/" . $accAddr . self::API_PATH_VALIDATORS, null, "get");
    }
    public function getDelegationByAccAddrAndValAddr($accAddr, $valAddr)
    {
        return CurlUtil::callOnce($this->url .  self::API_GET_DELEGATORS . "/" . $accAddr . self::API_GET_DELEGATORS . "/" . $valAddr, null, "get");
    }

    public function getValidators()
    {
        return CurlUtil::callOnce($this->url . self::API_GET_VALIDATORS, null, "get");
    }

    public function getValidatorByValAddr($valAddr)
    {
        return CurlUtil::callOnce($this->url . self::API_GET_VALIDATORS . $valAddr, null, "get");
    }

    public function getBlockByHeight($id)
    {
        return CurlUtil::callOnce($this->url . self::API_GET_BLOCKS . "/" . $id, null, "get");
    }

    public function getLatestBlock()
    {
        return CurlUtil::callOnce($this->url . self::API_GET_LATEST, null, "get");
    }
}
