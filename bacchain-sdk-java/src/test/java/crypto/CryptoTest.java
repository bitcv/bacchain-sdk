package crypto;

import com.bitcv.chain.common.Constants;
import com.bitcv.chain.crypto.Crypto;
import com.bitcv.chain.util.AddressUtil;
import org.bouncycastle.util.encoders.Hex;
import org.junit.Assert;
import org.junit.Test;

import java.security.NoSuchAlgorithmException;
import java.util.Base64;

public class CryptoTest {
    @Test
    public void testGeneratePrivateKey() {
        String priv = Crypto.generatePrivateKey();
        System.out.println(priv);
    }

    @Test
    public void testGenerateAddress() {
        String priv = Crypto.generatePrivateKey();
        priv = "2c999c5afe7f0c902846e1b286fed29c5c5914998655d469568560955abe0d5d";
        long startTime = System.currentTimeMillis();
        byte[] pub = Crypto.generatePubKeyFromPriv(priv);
        System.out.println("pubkey");
        System.out.println(Hex.toHexString(pub));
        try {
            String addr = AddressUtil.createNewAddressSecp256k1(pub);
            System.out.println(addr);
        }catch (Exception e){
            e.printStackTrace();
        }

        long endTime = System.currentTimeMillis();
        float excTime = (float) (endTime - startTime) / 1000;
        System.out.println("执行时间：" + excTime + "s");

    }

    @Test
    public void testVerify() {
        String priv = Crypto.generatePrivateKey();
        byte[] msg = new String("hello").getBytes();
        try {
            byte[] sig = Crypto.sign(msg, priv);
            String sigBase64 = Base64.getEncoder().encodeToString(sig);
            byte[] pub = Crypto.generatePubKeyFromPriv(priv);
            boolean res = Crypto.validateSig(msg, Base64.getEncoder().encodeToString(pub), sigBase64);
            Assert.assertEquals(true, res);
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }
    }

    @Test
    public void generateMnemonic() {
        System.out.println(Crypto.generateMnemonic());
    }

    @Test
    public void generatePrivateKeyFromMnemonic() {
        String mnemonic = Constants.ACC_ADDR1_MNEMONIC;

        String prikey = Crypto.generatePrivateKeyFromMnemonic(mnemonic);

        System.out.println("mnemonic");
        System.out.println(mnemonic);

        System.out.println("prikey");
        System.out.println(prikey);

        System.out.println("pubkey");
        System.out.println(Hex.toHexString(Crypto.generatePubKeyFromPriv(prikey)));

        System.out.println("address");
        System.out.println(AddressUtil.generateAddressFromPriv(prikey));
        //bac10tyhju9pfpfkt7hrd2zqr0vjn4k5sfrrhenf7v
    }


}
