#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
@name: strtest.py
@editor: PyCharm
@Date: 2019/3/26 10:59
@Author: ly
@Description: 
"""
import jieba
from gensim import corpora, models, similarities

base_str = 'Gensim是一个比较成熟的工具包，很多公司、个人已经成功将该工具应用于快速原型和生产。但是也并不意味着他是完美的。'
test_str = 'Gensim虽然是一个比较成熟的工具包，但是仍然不完美'

punctuations = [',', '.', '-', '?', '。', '，', '？', ';', '；', '、']
base_cut = jieba.cut(base_str)
base_cut_arr = [list(base_cut)]
print(base_cut_arr)
dictionary = corpora.Dictionary(base_cut_arr)
corpus = [dictionary.doc2bow(t) for t in base_cut_arr]
lsi = models.LsiModel(corpus, id2word=dictionary, num_topics=20)
index = similarities.MatrixSimilarity(lsi[corpus])
cmp_str = dictionary.doc2bow(jieba.cut(test_str))
query_lsi = lsi[cmp_str]
sims = index[query_lsi]
print(sims)
