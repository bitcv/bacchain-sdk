package com.bitcv.chain.examples;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.bitcv.chain.common.Constants;
import com.bitcv.chain.msg.MsgSend;
import com.bitcv.chain.msg.utils.Message;
import com.bitcv.chain.util.HttpUtil;

public class ExampleRpc {


    public static void main(String[] args) {

        String res = "";

        //获取区块信息
        res  = HttpUtil.getBlock(1);
        System.out.println(res);

        //获取account_number,sequence,资料列表信息
        res  = HttpUtil.getAccount(Constants.ACC_ADDR1);
        System.out.println(res);

        //获取资产详情
        res  = HttpUtil.getBalance(Constants.ACC_ADDR1);
        System.out.println(res);


        //获取最新区块
        res  = HttpUtil.getLatestBlock();
        System.out.println(res);

        //根据hash获取交易详情
        res = HttpUtil.getTxByHash("480FF263823655235A34646BBD5A4305FA879744AD28EDE096C5A4FF4416B2E7");
        System.out.println(res);


    }


}