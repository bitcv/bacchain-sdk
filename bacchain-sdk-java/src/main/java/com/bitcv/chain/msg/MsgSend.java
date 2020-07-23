package com.bitcv.chain.msg;

import com.bitcv.chain.msg.utils.Message;
import com.bitcv.chain.msg.utils.type.MsgSendValue;
import com.bitcv.chain.types.Token;


import java.util.ArrayList;
import java.util.List;

public class MsgSend extends MsgBase {


    private String toAddr;
    private String fromAddr;

    public String getToAddr() {
        return toAddr;
    }

    public void setToAddr(String toAddr) {
        this.toAddr = toAddr;
    }

    public String getFromAddr() {
        return fromAddr;
    }

    public void setFromAddr(String fromAddr) {
        this.fromAddr = fromAddr;
    }

    public String getDenom() {
        return denom;
    }

    public void setDenom(String denom) {
        this.denom = denom;
    }

    public String getAmountDenom() {
        return amountDenom;
    }

    public void setAmountDenom(String amountDenom) {
        this.amountDenom = amountDenom;
    }

    private String denom;
    private String amountDenom;




    public Message produceSendMsg() {

        List<Token> amountList = new ArrayList<>();
        Token amount = new Token();
        amount.setDenom(this.denom);
        amount.setAmount(this.amountDenom);
        amountList.add(amount);

        MsgSendValue value = new MsgSendValue();
        value.setFromAddress(this.fromAddr);
        value.setToAddress(this.toAddr);
        value.setAmount(amountList);

        Message<MsgSendValue> msg = new Message<>();
        msg.setType(msgType);
        msg.setValue(value);
        return msg;
    }

}
