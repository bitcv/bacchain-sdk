
'use strict'

const fetch = require("node-fetch");
const bip39 = require('bip39');
const secp256k1 = require('secp256k1');
const crypto = require('crypto');
const bip32 = require('bip32');
const bech32 = require('bech32');
const bitcoinjs = require('bitcoinjs-lib');

let bacchainSdk = function(url, chainId) {
	this.url = url;
	this.chainId = chainId;
	this.path = "m/44'/572'/0'/0/0";

	if (!this.url) {
		throw new Error("url object was not set or invalid")
	}
	if (!this.chainId) {
		throw new Error("chainId object was not set or invalid")
	}
}

function newBacchainSdk(url, chainId) {
	return new bacchainSdk(url, chainId);
}

function convertStringToBytes(str) {
	if (typeof str !== "string") {
	    throw new Error("str expects a string")
	}
	var myBuffer = [];
	var buffer = Buffer.from(str, 'utf8');
	for (var i = 0; i < buffer.length; i++) {
	    myBuffer.push(buffer[i]);
	}
	return myBuffer;
}

function getPubKeyBase64(ecpairPriv) {
	const pubKeyByte = secp256k1.publicKeyCreate(ecpairPriv);
	return Buffer.from(pubKeyByte, 'binary').toString('base64');
}

function sortObject(obj) {
	if (obj === null) return null;
	if (typeof obj !== "object") return obj;
	if (Array.isArray(obj)) return obj.map(sortObject);
	const sortedKeys = Object.keys(obj).sort();
	const result = {};
	sortedKeys.forEach(key => {
		result[key] = sortObject(obj[key])
	});
	return result;
}

bacchainSdk.prototype.setBech32MainPrefix = function(bech32MainPrefix) {
	this.bech32MainPrefix = bech32MainPrefix;

	if (!this.bech32MainPrefix) {
		throw new Error("bech32MainPrefix object was not set or invalid")
	}
}

bacchainSdk.prototype.setPath = function(path) {
	this.path = path;

	if (!this.path) {
		throw new Error("path object was not set or invalid")
	}
}

bacchainSdk.prototype.getAddress = function(mnemonic) {
    if (typeof mnemonic !== "string") {
        throw new Error("mnemonic expects a string")
    }
    const seed = bip39.mnemonicToSeed(mnemonic);
    const node = bip32.fromSeed(seed);
    const child = node.derivePath(this.path);
    const words = bech32.toWords(child.identifier);
    return bech32.encode(this.bech32MainPrefix, words);
}

bacchainSdk.prototype.getAccounts = function(address) {
    let accountsApi = "/auth/accounts/";
	return fetch(this.url + accountsApi + address)
	.then(response => response.json())
}



bacchainSdk.prototype.getECPairPriv = function(mnemonic) {
	if (typeof mnemonic !== "string") {
	    throw new Error("mnemonic expects a string")
	}
	const seed = bip39.mnemonicToSeed(mnemonic);
	const node = bip32.fromSeed(seed);
	const child = node.derivePath(this.path);
	const ecpair = bitcoinjs.ECPair.fromPrivateKey(child.privateKey, {compressed : false})
	return ecpair.privateKey;
}

bacchainSdk.prototype.NewStdMsg = function(input) {
	const stdSignMsg = new Object;
	switch (input.type){
        case "bacchain/MsgSend":
            stdSignMsg.json = {
                msgs: [
                    {
                        type: input.type,
                        value: {
                            amount: [
                                {
                                    amount: String(input.amount),
                                    denom: input.amountDenom
                                }
                            ],
                            from_address: input.from_address,
                            to_address: input.to_address,
                        }
                    }
                ]
            }
            break;
        case "bacchain/MsgMultiSend":
            stdSignMsg.json = {
                msgs: [
                    {
                        type: input.type,
                        value: {
                            inputs : input.Input,
                            outputs: input.Output
                        }
                    }
                ]
            }
            break;
        case "bacchain/MsgDelegate":
            stdSignMsg.json = {
                msgs: [
                    {
                        type: input.type,
                        value: {
                            delegator_address: input.delegator_address,
                            validator_address: input.validator_address,
                            amount: {
                                denom: input.amountDenom,
                                amount: String(input.amount),
                            },
                        }
                    }
                ]
            }
            break;
        case "bacchain/MsgUndelegate":
            stdSignMsg.json = {
                msgs: [
                    {
                        type: input.type,
                        value: {
                            amount: {
                                amount: String(input.amount),
                                denom: input.amountDenom
                            },
                            delegator_address: input.delegator_address,
                            validator_address: input.validator_address
                        }
                    }
                ]
            }
            break;
        case "bacchain/MsgWithdrawDelegationReward":
            stdSignMsg.json = {
                msgs: [
                    {
                        type: input.type,
                        value: {
                            delegator_address: input.delegator_address,
                            validator_address: input.validator_address
                        }
                    }
                ]
            }
            break;
        case "bacchain/MsgWithdrawValidatorCommission":
            stdSignMsg.json = {
                msgs: [
                    {
                        type: input.type,
                        value: {
                            validator_address: input.validator_address
                        }
                    }
                ]
            }
            break;
        case  "bacchain/MsgSubmitProposal":
            stdSignMsg.json = {
                msgs: [
                    {
                        type: input.type,
                        value: {
                            description: input.description,
                            initial_deposit: [
                                {
                                    amount: String(input.initialDepositAmount),
                                    denom: input.initialDepositDenom
                                }
                            ],
                            proposal_type: input.proposal_type,
                            proposer: input.proposer,
                            title: input.title
                        }
                    }
                ]
            }
            break;
        case "bacchain/MsgDeposit":
            stdSignMsg.json = {
                msgs: [
                    {
                        type: input.type,
                        value: {
                            amount: [
                                {
                                    amount: String(input.amount),
                                    denom: input.amountDenom
                                }
                            ],
                            depositor: input.depositor,
                            proposal_id: String(input.proposal_id)
                        }
                    }
                ]
            }
            break;
        case  "bacchain/MsgVote":
            stdSignMsg.json = {
                msgs: [
                    {
                        type: input.type,
                        value: {
                            option: input.option,
                            proposal_id: String(input.proposal_id),
                            voter: input.voter
                        }
                    }
                ],
            }
            break;
        case  "bacchain/MsgBeginRedelegate":
            stdSignMsg.json = {
                msgs: [
                    {
                        type: input.type,
                        value: {
                            amount: {
                                amount: String(input.amount),
                                denom: input.amountDenom
                            },
                            delegator_address: input.delegator_address,
                            validator_dst_address: input.validator_dst_address,
                            validator_src_address: input.validator_src_address
                        }
                    }
                ]
            }
            break;
        case  "bacchain/MsgModifyWithdrawAddress":
            stdSignMsg.json = {
                msgs: [
                    {
                        type: input.type,
                        value: {
                            delegator_address: input.delegator_address,
                            withdraw_address: input.withdraw_address
                        }
                    }
                ]
            }
            break;
        case  "bacchain/MsgBurnBcvToStake":
            stdSignMsg.json = {
                msgs: [
                    {
                        type: input.type,
                        value: {
                            amount: {
                                amount: String(input.amount),
                                denom: input.amountDenom
                            },
                            acc_address: input.acc_address,
                        }
                    }
                ]
            }
            break;
        case  "bacchain/MsgBurnBcvToEnergy":
            stdSignMsg.json = {
                msgs: [
                    {
                        type: input.type,
                        value: {
                            amount: {
                                amount: String(input.amount),
                                denom: input.amountDenom
                            },
                            acc_address: input.acc_address,
                        }
                    }
                ]
            }
            break;
        case "bacchain/MsgEditValidator":
            stdSignMsg.json = {
                msgs: [
                    {
                        type: input.type,
                        value: {
                            address: input.address,
                            Description:{
                                moniker:"[do-not-modify]",
                                identity:"[do-not-modify]",
                                website:"[do-not-modify]",
                                details:"[do-not-modify]"
                            },
                            commission_rate:String(input.commission_rate),
                            min_self_delegation:null
                        }
                    }
                ]
            }
            break;
        case "bacchain/MsgEdata":
            stdSignMsg.json = {
                msgs: [
                    {
                        type: input.type,
                        value: {
                            account: input.account,
                            utype: input.utype,
                            data: input.data,
                        }
                    }
                ]
            }
            break;
        case "bacchain/MsgIssueToken":
            stdSignMsg.json = {
                msgs: [
                    {
                        type: input.type,
                        value: {
                            owner_address: input.owner_address,
                            outer_name: input.outer_name,
                            supply_num: input.supply_num,
                            margin:{
                                amount: String(input.margin_amount),
                                denom: input.margin_denom
                            },
                            precision:input.precision,
                            website:input.website,
                            description:input.description,
                        }
                    }
                ]
            }
            break;
        case "bacchain/MsgRedeem":
            stdSignMsg.json = {
                msgs: [
                    {
                        type: input.type,
                        value: {
                            account: input.account,
                            amount:{
                                amount: String(input.redeem_amount),
                                denom: input.redeem_inner_name
                            },
                        }
                    }
                ]
            }
            break;
        case "bacchain/MsgAddMargin":
            stdSignMsg.json = {
                msgs: [
                    {
                        type: input.type,
                        value: {
                            account: input.account,
                            inner_name: input.inner_name,
                            amount:{
                                amount: String(input.margin_amount),
                                denom: input.margin_denom
                            },
                        }
                    }
                ]
            }
            break;
        default:
            throw new Error("error type " + input.type)
    }


    stdSignMsg.json.sequence = String(input.sequence)
    stdSignMsg.json.account_number = String(input.account_number)
	stdSignMsg.json.chain_id = this.chainId
	stdSignMsg.json.memo = input.memo
    stdSignMsg.json.fee =  {
        amount: [
            {
                amount: String(input.fee),
                denom: input.feeDenom
            }
        ],
        gas: String(input.gas)
    }

	stdSignMsg.bytes = convertStringToBytes(JSON.stringify(sortObject(stdSignMsg.json)))

	return stdSignMsg;
}

bacchainSdk.prototype.sign = function(stdSignMsg, ecpairPriv, modeType = "sync") {
    const hash = crypto.createHash('sha256').update(JSON.stringify(sortObject(stdSignMsg.json))).digest('hex');
    const buf = Buffer.from(hash, 'hex');
    let signObj = secp256k1.sign(buf, ecpairPriv);
    var signatureBase64 = Buffer.from(signObj.signature, 'binary').toString('base64');
    const signedTx = {
        "tx": {
            "msg": stdSignMsg.json.msgs,
            "fee": stdSignMsg.json.fee,
            "signatures": [
                {
                    "signature": signatureBase64,
                    "pub_key": {
                        "type": "tendermint/PubKeySecp256k1",
                        "value": getPubKeyBase64(ecpairPriv)
                    }
                }
            ],
            "memo": stdSignMsg.json.memo
        },
        "mode": modeType
    }
    return signedTx;
}


bacchainSdk.prototype.broadcast = function(signedTx) {
    return fetch(this.url + "/txs", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(signedTx)
    })
        .then(response => response.json())
}


bacchainSdk.prototype.getAccounts = function(address) {
    return fetch(this.url + "/auth/accounts/" + address)
        .then(response => response.json())
}

bacchainSdk.prototype.getTxInfoByHash= function(hash) {
    return fetch(this.url + "/txs/" + hash)
        .then(response => response.json())
}

bacchainSdk.prototype.getBalances = function(addr) {
    return fetch(this.url + "/bank/balances/" + addr) .then(response => response.json())
}

bacchainSdk.prototype.getBcvSupply = function() {
    return fetch(this.url + "/bank/supply/bcv" ) .then(response => response.json())
}

bacchainSdk.prototype.getDelegationsByAccAddr = function(addr) {
    return fetch(this.url + "/staking/delegators/" + addr +"/delegations") .then(response => response.json())
}

bacchainSdk.prototype.getDelegateValidatorByAccAddr = function(accAddr) {
    return fetch(this.url + "/staking/delegators/" + accAddr +"/validators") .then(response => response.json())
}

bacchainSdk.prototype.getDelegateValidatorByAccAddr = function(accAddr) {
    return fetch(this.url + "/staking/delegators/" + accAddr +"/validators") .then(response => response.json())
}
bacchainSdk.prototype.getDelegationByAccAddrAndValAddr = function(accAddr,valAddr) {
    return fetch(this.url + "/staking/delegators/" + accAddr +"/delegations/" + valAddr) .then(response => response.json())
}

bacchainSdk.prototype.getValidators = function() {
    return fetch(this.url + "/staking/validators") .then(response => response.json())
}

bacchainSdk.prototype.getValidatorByValAddr = function(valAddr) {
    return fetch(this.url + "/staking/validators/" + valAddr) .then(response => response.json())
}

bacchainSdk.prototype.getBlockByHeight = function(id) {
    return fetch(this.url + "/blocks/" + id) .then(response => response.json())
}

bacchainSdk.prototype.getLatestBlock = function() {
    return fetch(this.url + '/blocks/latest') .then(response => response.json())
}


bacchainSdk.prototype.generateRandomMnemonic = function() {
    return bip39.generateMnemonic(256);
}

//根据注记词获取私钥
bacchainSdk.prototype.getPriKeyByMnemonic = function(mnemonic) {
    return this.getECPairPriv(mnemonic).toString('hex');
}

//根据注记词获取公钥
bacchainSdk.prototype.getPubKeyByMnemonic = function(mnemonic) {
    return getPubKeyBase64(this.getECPairPriv(mnemonic));
}

//根据私钥获取公钥
bacchainSdk.prototype.getPubKeyByPriKey = function(priKey) {
    var buffer = Buffer.from(priKey,'hex')
    var pubKeyByte = secp256k1.publicKeyCreate(buffer);
    return Buffer.from(pubKeyByte, 'binary').toString('base64');
}

//根据私钥获取地址
bacchainSdk.prototype.getAddrByPriKey = function(priKey) {
    var buffer = Buffer.from(priKey,'hex')
    var pubKeyByte = secp256k1.publicKeyCreate(buffer);
    const words = bech32.toWords(bitcoinjs.crypto.hash160(pubKeyByte));
    return bech32.encode(this.bech32MainPrefix, words);
}

//根据销毁地址关键字获取地址
bacchainSdk.prototype.getAddrForBurn = function(addrKey) {
    var buffer = Buffer.from(addrKey)
    var hash = bitcoinjs.crypto.sha256(buffer)
    var hash40 = hash.toString("hex").substring(0, 40);
    var hash40_buffer = Buffer.from(hash40, 'hex');

    const words = bech32.toWords(hash40_buffer);
    return bech32.encode(this.bech32MainPrefix, words);
}


module.exports = {
	newBacchainSdk: newBacchainSdk
}
