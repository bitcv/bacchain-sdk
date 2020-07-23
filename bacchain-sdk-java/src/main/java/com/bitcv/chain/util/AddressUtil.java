package com.bitcv.chain.util;

import com.bitcv.chain.common.Constants;
import com.bitcv.chain.crypto.Crypto;
import com.google.crypto.tink.subtle.Bech32;
import com.bitcv.chain.crypto.encode.ConvertBits;
import com.bitcv.chain.crypto.hash.Ripemd;
import com.bitcv.chain.exception.AddressFormatException;
import org.bouncycastle.util.encoders.Hex;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class AddressUtil {


    public static String createNewAddressSecp256k1(byte[] publickKey) throws Exception {
        String addressResult = null;
        try {
            byte[] pubKeyHash = sha256Hash(publickKey, 0, publickKey.length);
            byte[] address = Ripemd.ripemd160(pubKeyHash);
            byte[] bytes = encode(0, address);
            addressResult = com.bitcv.chain.crypto.encode.Bech32.encode(Constants.ACC_MAIN_PREFIX, bytes);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return addressResult;

    }

    public static byte[] getPubkeyValue(byte[] publickKey) throws Exception {
        try {
            byte[] pubKeyHash = sha256Hash(publickKey, 0, publickKey.length);
            byte[] value = Ripemd.ripemd160(pubKeyHash);
            return value;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

    }

    public static byte[] decodeAddress(String address){
        byte[] dec = Bech32.decode(address).getData();
        return ConvertBits.convertBits(dec, 0, dec.length, 5, 8, false);
    }

    private static byte[] sha256Hash(byte[] input, int offset, int length) throws NoSuchAlgorithmException {
        byte[] result = new byte[32];
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        digest.update(input, offset, length);
        return digest.digest();
    }

    private static byte[] encode(int witnessVersion, byte[] witnessProgram) throws AddressFormatException {
        byte[] convertedProgram = ConvertBits.convertBits(witnessProgram, 0, witnessProgram.length, 8, 5, true);
        return convertedProgram;
    }


    public static String generateAddressFromPriv(String privateKey) {
        String pubKey = Crypto.generatePubKeyHexFromPriv(privateKey);
        try {
            String addr = createNewAddressSecp256k1(Hex.decode(pubKey));
            return addr;
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }

}
