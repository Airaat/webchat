CREATE TABLE IF NOT EXISTS yhub_ydoc_v1
(
    org        text,
    docid      text,
    branch     text,
    t          text,  -- redis identifier (timestamp)
    created    INT8,  -- Unix timestamp in milliseconds
    gcDoc      bytea, -- Garbage-collected Y.js update
    nongcDoc   bytea, -- Non-garbage-collected Y.js update
    contentmap bytea, -- Content map binary
    contentids bytea, -- Content IDs binary
    PRIMARY KEY (org, docid, branch, t)
);
