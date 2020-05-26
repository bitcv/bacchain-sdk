/**
 * 离线产生私钥
 * 生成两个文件
 * _addr.log    包含地址
 * addrAll.log  包含地址和私钥
 */
var fs = require('fs')
const bacchainjs = require("../src");
const chainId = "bacchain-mainnet-1.0";
const lcdUrl = "http://127.0.0.1:1317";
const bacchainSdk = bacchainjs.newBacchainSdk(lcdUrl, chainId)
bacchainSdk.setBech32MainPrefix("bac")


const num = process.argv[2]
var date = new Date();
var addr = date.getFullYear() +"_" +(date .getMonth()+1) +"_" + date .getDate() +"_addr.log"
var addrfull = date.getFullYear() +"_" +date .getMonth() +"_" + date .getDate() +"_addrAll.log"


var pArr1 = new Array()
var pArr2 = new Array()
for(i= 0;i<num;i++){
	mnemonic = bacchainSdk.generateRandomMnemonic()
	tmpAddr = bacchainSdk.getAddress(mnemonic)
	pArr1.push(tmpAddr)
	pArr2.push({"pubkey":tmpAddr,"privatekey":mnemonic})
}

if(pArr1.length != pArr2.length){
	console.log(err)
	return;
}


fs.writeFileSync(addr, JSON.stringify(pArr1))
fs.writeFileSync(addrfull, JSON.stringify(pArr2))
