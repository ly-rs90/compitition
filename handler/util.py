#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
@name: util.py
@editor: PyCharm
@Date: 2019/3/20 15:07
@Author: ly
@Description: 
"""
import difflib
import hashlib
# import jieba
# from gensim import corpora, models, similarities


def hash_str(s):
    m5 = hashlib.md5()
    m5.update(s.encode('utf-8'))
    return m5.hexdigest()


def similar_simple(doc, test_str):
    return difflib.SequenceMatcher(None, doc, test_str).quick_ratio()


# def similar(doc, test_str):
#     # 标点符号
#     punctuation = [',', '.', ';', ':', '?', '#', '@', '!', '$', '%', '&', '*', '(', ')', '-', '=', '<', '>',
#                    '！', '，', '。', '《', '》', '？', '/', '；', '：', '【', '】', '、', '|']
#
#     doc_cut = jieba.cut(doc)
#     doc_cut_list = [n for n in doc_cut if n not in punctuation]     # 目标字符串分词
#
#     test_cut = jieba.cut(test_str)
#     test_cut_list = [n for n in test_cut if n not in punctuation]   # 测试字符串分词
#
#     # 用目标字符串制作语料库并向量化
#     dictionary = corpora.Dictionary([doc_cut_list])
#     corpus = [dictionary.doc2bow(d) for d in [doc_cut_list]]
#
#     # 测试字符串向量化
#     test_vec = dictionary.doc2bow(test_cut_list)
#
#     # 建模分析
#     tfidf = models.TfidfModel(corpus)
#
#     index = similarities.SparseMatrixSimilarity(tfidf[corpus], num_features=len(dictionary.keys()))
#     sim = index[tfidf[test_vec]]
#     return sim[0]
