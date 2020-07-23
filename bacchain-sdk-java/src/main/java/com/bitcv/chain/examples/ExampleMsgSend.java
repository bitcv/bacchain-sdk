package com.bitcv.chain.examples;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.bitcv.chain.common.Constants;

import com.bitcv.chain.msg.MsgSend;
import com.bitcv.chain.msg.utils.Message;
import com.bitcv.chain.util.HttpUtil;

public class ExampleMsgSend {


    /**
     * 不需要装本地库
     * https://github.com/ACINQ/secp256k1/tree/jni-embed
     * ./autogen.sh
     * ./configure --enable-jni --enable-module-ecdh --enable-experimental --enable-module-recovery
     * make
     */
    public static void main(String[] args) {
        MsgSend msg = new MsgSend();
        msg.setMsgType("bacchain/MsgSend");
        msg.setFromAddr(Constants.ACC_ADDR1);
        msg.setToAddr("bac1hmkvg4ylpp2vk8aj0tzuagh7yrvjhpgh5durxl");
        msg.setDenom("nbac");
        msg.setAmountDenom("1");
        Message messages = msg.produceSendMsg();

        String res  = HttpUtil.getAccount(Constants.ACC_ADDR1);
        JSONObject accountJson = JSON.parseObject(res);

        String accountNum = (String) accountJson.getJSONObject("value").get("account_number");
        String sequence = (String) accountJson.getJSONObject("value").get("sequence");

        msg.submit(messages, "100000000", "2000000", "bacchain transfer",accountNum,sequence);

    }


}