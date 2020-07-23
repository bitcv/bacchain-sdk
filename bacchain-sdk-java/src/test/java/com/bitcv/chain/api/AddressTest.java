package com.bitcv.chain.api;

import com.bitcv.chain.common.Constants;
import com.bitcv.chain.util.AddressUtil;
import org.bouncycastle.util.encoders.Hex;
import org.junit.Test;


public class AddressTest {

    @Test
    public void testCreateAddress() {
        String mainPrefix = Constants.ACC_MAIN_PREFIX;
        String pubKey = "02141202d82740af1b754b442f5fd9c4a862d49b5cafca5d04a9f06216ddf545bd";
        try {
            System.out.println(AddressUtil.createNewAddressSecp256k1( Hex.decode(pubKey)));
            //expected: bac1p0w9dwkgteyd8298tn3sed32g5q9ny7xmk2h5w
        } catch (Exception e) {
            System.out.println("create bac address exception");
        }
    }
}
