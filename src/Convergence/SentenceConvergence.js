import nodejieba from "nodejieba";

// 載入字典
nodejieba.load({ dict: "./jieba/dict.txt" });

// file process
import fs from "fs";
