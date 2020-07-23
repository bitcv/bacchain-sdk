package com.bitcv.chain.util;

import com.bitcv.chain.common.Constants;
import com.bitcv.chain.common.HttpUtils;

public class HttpUtil {

    public static String getBlock(long num) {
        String url = Constants.BASE_URL  + Constants.SUB_URL_BLOCK + num;
        return HttpUtils.httpGet(url);
    }


    public static String getAccount(String userAddress) {
        String url = Constants.BASE_URL  + Constants.SUB_URL_ACCOUNT + "/" + userAddress;
        return HttpUtils.httpGet(url);
    }

    public static String getBalance(String userAddress) {
        String url = Constants.BASE_URL  + Constants.SUB_URL_BALANCE+ "/" + userAddress;
        return HttpUtils.httpGet(url);
    }


    public static String getLatestBlock() {
        String url = Constants.BASE_URL  + Constants.SUB_URL_BLOCK_LATEST;
        return HttpUtils.httpGet(url);
    }

    public static String getTxByHash(String hash) {
        String url = Constants.BASE_URL  + Constants.SUB_URL_TX + "/" + hash;
        return HttpUtils.httpGet(url);
    }

}
