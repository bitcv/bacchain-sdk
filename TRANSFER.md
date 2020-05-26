

# BAC链主网SDK

主要提供BAC主网钱包生成、发送转账交易和转账相关信息查询，通过网页浏览BAC链交易信息，请访问[BAC区块浏览](https://main.bitcv.net/)



# 使用

```js
const bacchainjs = require("./src")
const chainId = "bacchain-mainnet-1.0"
const lcdUrl = "http://13.231.192.54:1317/"
const bacchainSdk = bacchainjs.newBacchainSdk(lcdUrl, chainId)
```

说明：

* 主网供访问节点为：‘`http://13.231.192.54:1317/`
* BAC基本信息：币种符号为 `nbac` ，小数位数为 `9` 位
* BCV基本信息：币种符号为 `ubcv` ，小数位数为 `6` 位
* 矿工费使用BAC，最小值为每笔交易`0.1 BAC`



# API

## 账号

### 生成钱包地址

```js
const bip39 = require('bip39')

// 生成助记词
var mnemonic = bip39.generateMnemonic(256)

//获取地址和私钥
bacchainSdk.setBech32MainPrefix("bac")
var accAddr = bacchainSdk.getAddress(mnemonic)
var ecpairPriv = bacchainSdk.getECPairPriv(mnemonic)
```



### 查询钱包信息

```js
bacchainSdk.getAccounts(accAddr).then(data => {
    console.log("查询钱包信息")
    console.log(data)
})
```

返回示例：

```json
{
    "type": "auth/Account",
    "value": {
        "address": "bac1ywmevyc2wqeh90kwdx6v3uxn0jkpqxxxjffx34",
        "coins": [{
            "denom": "nbac",
            "amount": "10000000000"
        }],
        "public_key": null,
        "account_number": "10383",
        "sequence": "0"
    }
}
```

返回参数说明

* `value.account_number` 钱包编号（与钱包地址唯一对应）
* `value.sequence` 交易编号
* `value.coins` 资产列表
  * `denom` 资产币种
  * `amount` 资产余额



### 查询钱包余额

```js
bacchainSdk.getBalances(accAddr).then(data => {
    console.log("查询钱包余额")
    console.log(data)
});
```

返回示例：

```json
[{
    "denom": "nbac",
    "amount": "10000000000"
}]
```

返回参数说明

* `denom` 资产币种
* `amount` 资产余额



## 区块

### 查询最新区块信息

```js
bacchainSdk.getLatestBlock().then(data => {
    console.log('查询最新区块信息')
    console.log(data)
})
```

返回示例

```json
{
    "block_meta": {
        "block_id": {
            "hash": "9CFE81B4891C4FB9071407679D76CDCE16568BA33368038AC48E4ED9FF404BE9",
            "parts": {
                "total": "1",
                "hash": "E9013CE1865BA1EC5F7FA84ADB52757CEF51EF0D1F56E5659ED9B26D507D955B"
            }
        },
        "header": { ... }
    },
    "block": {
        "header": { ... },
        "data": {
            "txs": ["0AHwYl3uCkQUFoD4ChSV/83hzsfXIVepSDefMi/7zm1LVBIUzpaKM2jM/o2AxlqrdJQ2x1BVS6kaEgoEbmJhYxIKODAwMDAwMDAwMBIYChEKBG5iYWMSCTEwMDAwMDAwMBCAwtcvGmoKJuta6YchA+3GoGaRood8lXhLeovfXyon5KX8SJLQ5ZX/wCG54QSOEkCVSeuyDpBQXX5DzyoqTya7sNwHkyBYXJjF9wa791RwgmyUpkSCbD9TJQF/4xek+fA9q+TgVXZugZ88RpcyqI8y"]
        },
        "evidence": {
            "evidence": null
        },
        "last_commit": {
            "block_id": {
                "hash": "E2669A3FD194121A196EC5B787AEAF3B21584CEA71E9D6110FC6A00E97246E5C",
                "parts": {
                    "total": "1",
                    "hash": "5F3FDAB0A13A4D7B18D4157923B51BF46E1EC06DF4FA1C2DC52DA5C247C42540"
                }
            },
            "precommits": [ ... ]
        }
    }
}
```

返回参数说明：

* `block.header.height` 当前区块高度
* `block.header.time` 出块时间
* `block.data.txs` 区块打包的交易哈希列表

解析交易hash

```js
const crypto=require('crypto');
var tx = '0AHwYl3uCkQUFoD4ChSV/83hzsfXIVepSDefMi/7zm1LVBIUzpaKM2jM/o2AxlqrdJQ2x1BVS6kaEgoEbmJhYxIKODAwMDAwMDAwMBIYChEKBG5iYWMSCTEwMDAwMDAwMBCAwtcvGmoKJuta6YchA+3GoGaRood8lXhLeovfXyon5KX8SJLQ5ZX/wCG54QSOEkCVSeuyDpBQXX5DzyoqTya7sNwHkyBYXJjF9wa791RwgmyUpkSCbD9TJQF/4xek+fA9q+TgVXZugZ88RpcyqI8y';
var buffer = new Buffer.from(tx, 'base64')
var txHash = crypto.createHash('sha256').update(buffer).digest('hex')
console.log(txHash)
```



### 根据区块高度查询区块信息

```js
var blockHeight = 1
bacchainSdk.getBlockByHeight(blockHeight).then(data => {
    console.log("根据高度获取区块信息");
    console.log(data);
})
```

返回参数同上



## 交易

### 查询交易信息

```js
var txHash= '874335d30c35934e4f787035f82fb37b76bc41127c2ed4fd69ddb1b8b2d71808'
bacchainSdk.getTxInfoByHash(txHash).then(data => {
    console.log("根据hash查询交易详情")
    console.log(data)
})
```

返回示例：

```json
{
    "height": "559379",
    "txhash": "874335D30C35934E4F787035F82FB37B76BC41127C2ED4FD69DDB1B8B2D71808",
    "raw_log": "[{\"msg_index\":\"0\",\"success\":true,\"log\":\"\"}]",
    "logs": [{
        "msg_index": "0",
        "success": true,
        "log": ""
    }],
    "gas_wanted": "100000000",
    "gas_used": "19423",
    "tags": [{
        "key": "action",
        "value": "send"
    }, {
        "key": "sender",
        "value": "bac1jhlumcwwcltjz4affqme7v30l08x6j65zkafez"
    }, {
        "key": "recipient",
        "value": "bac1e6tg5vmgenlgmqxxt24hf9pkcag92jafdtn37c"
    }],
    "tx": {
        "type": "auth/StdTx",
        "value": {
            "msg": [{
                "type": "bacchain/MsgSend",
                "value": {
                    "from_address": "bac1jhlumcwwcltjz4affqme7v30l08x6j65zkafez",
                    "to_address": "bac1e6tg5vmgenlgmqxxt24hf9pkcag92jafdtn37c",
                    "amount": [{
                        "denom": "nbac",
                        "amount": "8000000000"
                    }]
                }
            }],
            "fee": {
                "amount": [{
                    "denom": "nbac",
                    "amount": "100000000"
                }],
                "gas": "100000000"
            },
            "signatures": [ ... ],
            "memo": ""
        }
    },
    "timestamp": "2020-05-05T08:11:35Z"
}
```

返回参数说明：

* `height` 区块高度
* `timestamp` 打包时间
* `logs.success` 交易是否成功执行：true 成功，false 失败

* `tx.type` 交易类型
* `tx.value.msg[0].type` 消息类型
  * `bacchain/MsgWithdrawDelegationReward` 区块奖励提取
    * `tx.value.msg[0].value.delegator_address` 奖励转出地址
    * `tags[5].value` 奖励转入地址
    * `tags[1].value` 奖励数量和币种
  * `bacchain/MsgSend` 转账
    * `tx.value.msg[0].value.from_address` 转出地址
    * `tx.value.msg[0].value.to_address` 转入地址
    * `tx.value.msg[0].value.amount[0].denom` 转账币种
    * `tx.value.msg[0].value.amount[0].amount` 转账数量
*  `tx.value.fee.amount[0].denom` 消耗矿工费币种
* `tx.value.fee.amount[0].amount` 消耗矿工费数量
* `tx.value.memo` 交易备注信息



### 交易发送

```js
bacchainSdk.getAccounts(accAddr).then(accData => {
    // 获取钱包信息
    var accountNumber = accData.value.account_number
    var sequence = accData.value.sequence
    
    // 构造交易信息
    var txInfo = {
        type: "bacchain/MsgSend", // 转账
        from_address :"bac1jhlumcwwcltjz4affqme7v30l08x6j65zkafez", // 转出地址
        to_address :"bac19qp38ktnphpy0v8883ht8yw56y70v788vgde9n", // 转入
        amountDenom: "nbac", // 发送币种
        amount: 1000000000, // 转账数量
        feeDenom: "nbac", // 矿工费币种
        fee: 100000000, // 转账矿工费数量，最小值为0.1BAC
        gas: 2000000, // 转账消耗的最大gas
        memo: "HelloBac", // 转账备注
        account_number: accountNumber,
        sequence: sequence
    }
    
    // 交易签名
    var stdSignMsg = bacchainSdk.NewStdMsg(txInfo);
    var signedTx = bacchainSdk.sign(stdSignMsg, ecpairPriv); // ecpairPriv钱包私钥
  
    // 交易广播
    bacchainSdk.broadcast(signedTx).then(data => {
        console.log(data);
    })
})
```

返回示例

```json
{
    "height": "0",
    "txhash": "F6A8F4D8C7798BC1A7FDAEDDC89BD7F113B60A1EED94158AA5084524651B7269"
}
```

返回参数说明

* `txhash` 交易哈希







