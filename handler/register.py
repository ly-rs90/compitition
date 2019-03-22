#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
@name: register.py
@editor: PyCharm
@Date: 2019/3/20 14:52
@Author: ly
@Description: 用户注册
"""
import json
from tornado.web import RequestHandler
from .msg import Msg
from .util import hash_str


class Register(RequestHandler):
    def post(self, *args, **kwargs):
        msg = Msg()
        user_id = self.get_argument('id', '')
        user_name = self.get_argument('username', '')
        pass_word = self.get_argument('password', '')
        hash_pass_word = hash_str(user_id + pass_word)

        try:
            if user_name == 'admin':
                role = 0
            else:
                role = 1
            self.application.db.execute('''
                insert into user (id, name, password, role) values (?, ?, ?, ?)
            ''', (user_id, user_name, hash_pass_word, role))
            self.application.db.commit()
        except Exception as e:
            msg.code = 1
            msg.info = e.args[0]

        self.write(json.dumps(msg.json()))
