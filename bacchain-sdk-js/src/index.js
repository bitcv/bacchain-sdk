
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
	if (input.type == "bacchain/MsgSend") {
		stdSignMsg.json =
		{
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
	} else if (input.type == "bacchain/MsgMultiSend") {
        stdSignMsg.json =
            {
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
    } else if (input.type == "bacchain/MsgDelegate") {
		stdSignMsg.json =
		{
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
	} else if (input.type == "bacchain/MsgUndelegate") {
		stdSignMsg.json =
		{
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
	} else if (input.type == "bacchain/MsgWithdrawDelegationReward") {
		stdSignMsg.json =
		{
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
	} else if (input.type == "bacchain/MsgWithdrawValidatorCommission") {
        stdSignMsg.json =
            {
                msgs: [
                    {
                        type: input.type,
                        value: {
                            validator_address: input.validator_address
                        }
                    }
                ]
            }
    } else if (input.type == "bacchain/MsgSubmitProposal") {
		stdSignMsg.json =
		{
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
	} else if (input.type == "bacchain/MsgDeposit") {
		stdSignMsg.json =
		{
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
	} else if (input.type == "bacchain/MsgVote") {
		stdSignMsg.json =
		{
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
	} else if (input.type == "bacchain/MsgBeginRedelegate") {
		stdSignMsg.json =
		{
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
	} else if (input.type == "bacchain/MsgModifyWithdrawAddress") {
	    stdSignMsg.json =
		{
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
	} else if (input.type == "bacchain/MsgBurnBcvToStake") {
	    stdSignMsg.json =
		{
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
	} else if (input.type == "bacchain/MsgBurnBcvToEnergy") {
        stdSignMsg.json =
            {
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
    } else if (input.type == "bacchain/MsgEditValidator") {
        stdSignMsg.json =
            {
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
    }else {
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


module.exports = {
	newBacchainSdk: newBacchainSdk
}
