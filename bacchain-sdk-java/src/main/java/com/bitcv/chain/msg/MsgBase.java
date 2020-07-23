package com.bitcv.chain.msg;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.bitcv.chain.common.Utils;
import com.bitcv.chain.crypto.Crypto;
import com.bitcv.chain.msg.utils.Data2Sign;
import com.bitcv.chain.types.Pubkey;
import com.bitcv.chain.util.EncodeUtils;
import com.bitcv.chain.common.Constants;
import com.bitcv.chain.common.HttpUtils;
import com.bitcv.chain.msg.utils.BoardcastTx;
import com.bitcv.chain.msg.utils.Message;
import com.bitcv.chain.msg.utils.TxValue;
import com.bitcv.chain.types.Fee;
import com.bitcv.chain.types.Signature;
import com.bitcv.chain.types.Token;
import org.bouncycastle.util.Strings;
import org.bouncycastle.util.encoders.Base64;
import org.bouncycastle.util.encoders.Hex;

import java.util.ArrayList;
import java.util.List;

public class MsgBase {

    protected String restServerUrl = Constants.BASE_URL;

    protected String sequenceNum;
    protected String accountNum;
    protected String pubKeyString;
    protected String address;
    protected String operAddress;
    protected String priKeyString;

    static protected String msgType;

    public void setMsgType(String type) {
        this.msgType = type;
    }

    static Signature sign(Data2Sign obj, String privateKey) throws Exception {


        String mnemonic = "jeans antenna lucky way advice inherit sunset wild shock motion primary transfer exit excite design hope stage critic flush sister spell broom coach zoo";
        privateKey = Crypto.generatePrivateKeyFromMnemonic(mnemonic);


        String sigResult = null;
        sigResult = obj2byte(obj, privateKey);

        Signature signature = new Signature();
        Pubkey pubkey = new Pubkey();
        pubkey.setType("tendermint/PubKeySecp256k1");
        pubkey.setValue(Strings.fromByteArray(Base64.encode(Hex.decode(Crypto.generatePubKeyHexFromPriv(privateKey)))));
        signature.setPubkey(pubkey);
        signature.setSignature(sigResult);

        System.out.println("privateKey: ");
        System.out.println(privateKey);

        System.out.println("signature: ");
        System.out.println(sigResult);

        return signature;
    }



    static String obj2byte(Data2Sign data, String privateKey) {

        String sigResult = null;
        try {
            System.out.println("row data:");
            System.out.println(data);
            System.out.println("json data:");

            String signDataJson = Utils.serializer.toJson(data);
            System.out.println(signDataJson);

            //序列化
            byte[] byteSignData = signDataJson.getBytes();

            System.out.println("byte data length:");
            System.out.println(byteSignData.length);


            byte[] sig = Crypto.sign(byteSignData, privateKey);
            sigResult = Strings.fromByteArray(Base64.encode(sig));


        } catch (Exception e) {
            System.out.println("serialize msg failed");
        }
        return sigResult;
    }

    static String obj2byteok(Data2Sign data, String privateKey) {
        byte[] byteSignData = null;
        String sigResult = null;
        try {

            byte[] tmp = EncodeUtils.toJsonEncodeBytes(data);
            byteSignData = EncodeUtils.hexStringToByteArray(EncodeUtils.bytesToHex(tmp));

            byte[] sig = Crypto.sign(byteSignData, privateKey);
            sigResult = Strings.fromByteArray(Base64.encode(sig));


        } catch (Exception e) {
            System.out.println("serialize msg failed");
        }

        return sigResult;
    }

    public void submit(Message message,
                       String feeAmount,
                       String gas,
                       String memo,String accountNum,String sequenceNum) {
        try {
            List<Token> amountList = new ArrayList<>();
            Token amount = new Token();
            amount.setDenom("nbac");
            amount.setAmount(feeAmount);
            amountList.add(amount);

            //组装待签名交易结构
            Fee fee = new Fee();
            fee.setAmount(amountList);
            fee.setGas(gas);


            Message[] msgs = new Message[1];
            msgs[0] = message;

            Data2Sign data = new Data2Sign(accountNum, Constants.CHAIN_ID, fee, memo, msgs, sequenceNum);

            Signature signature = MsgBase.sign(data, priKeyString);

            BoardcastTx boardcastTx = new BoardcastTx();
            boardcastTx.setMode("block");

            TxValue stdTx = new TxValue();
            stdTx.setType("auth/StdTx");
            stdTx.setMsgs(msgs);
            stdTx.setFee(fee);
            stdTx.setMemo(memo);

            List<Signature> signatureList = new ArrayList<>();
            signatureList.add(signature);
            stdTx.setSignatures(signatureList);

            boardcastTx.setTx(stdTx);

            boardcast(boardcastTx.toJson());
        } catch (Exception e) {
            System.out.println("serialize transfer msg failed");
        }
    }


    public String getOperAddress() {
        return operAddress;
    }


    private String getSequance(JSONObject account) {
        String res = (String) account
//                .getJSONObject("result")
                .getJSONObject("value")
                .get("sequence");
        return res;
    }

    public String getAccountNumber(JSONObject account) {
        String res = (String) account
//                .getJSONObject("result")
                .getJSONObject("value")
                .get("account_number");
        return res;
    }

    protected JSONObject boardcast(String tx) {
        System.out.println("Boardcast tx:");
        System.out.println(tx);

        System.out.println("Response:");
        String res = HttpUtils.httpPost(Constants.BASE_URL+"/txs", tx);
        JSONObject result = JSON.parseObject(res);

        System.out.println(result);
        System.out.println("------------------------------------------------------");
        return result;
    }


}
