#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
@name: msg.py
@editor: PyCharm
@Date: 2019/2/28 15:13
@Author: ly
@Description: 服务端回写消息
"""


class Msg:
    def __init__(self):
        self._code = 0
        self._data = ''
        self._info = ''

    @property
    def code(self):
        return self._code

    @code.setter
    def code(self, value):
        self._code = value

    @property
    def data(self):
        return self._data

    @data.setter
    def data(self, value):
        self._data = value

    @property
    def info(self):
        return self._info

    @info.setter
    def info(self, value):
        self._info = value

    def json(self):
        return {'code': self.code, 'data': self.data, 'info': self.info}
