package com.bitcv.chain.common;

import com.google.gson.annotations.SerializedName;

public class SuccessRespon<T> {
    public String status;
    @SerializedName("data")
    public T dataObject;
}
