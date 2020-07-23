package com.bitcv.chain.examples;

import com.bitcv.chain.crypto.Crypto;
import com.bitcv.chain.util.AddressUtil;

public class ExampleAccount {


    public static void main(String[] args) {
        String mnemonic = "";
        String privateKey = "";
        String addr = "";

        mnemonic = "jeans antenna lucky way advice inherit sunset wild shock motion primary transfer exit excite design hope stage critic flush sister spell broom coach zoo";
        privateKey = Crypto.generatePrivateKeyFromMnemonic(mnemonic);
        addr =  AddressUtil.generateAddressFromPriv(privateKey);
        System.out.println("ADDR..." + addr);


        mnemonic  = Crypto.generateMnemonic();
        privateKey = Crypto.generatePrivateKeyFromMnemonic(mnemonic);
        addr =  AddressUtil.generateAddressFromPriv(privateKey);
        System.out.println("ADDR..." + addr);

    }


}