package com.airaat.webchat.domain.projection;

public interface MessagePageStats {
    long getTotalCount();
    boolean getHasMore();
    boolean getHasPrev();
}
