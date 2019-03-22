#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
@name: util.py
@editor: PyCharm
@Date: 2019/3/20 15:07
@Author: ly
@Description: 
"""
import hashlib


def hash_str(s):
    m5 = hashlib.md5()
    m5.update(s.encode('utf-8'))
    return m5.hexdigest()
