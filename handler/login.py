#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
@name: login.py
@editor: PyCharm
@Date: 2019/3/20 16:05
@Author: ly
@Description: 
"""
import json
from tornado.web import RequestHandler
from .msg import Msg
from .util import hash_str


class Login(RequestHandler):
    def post(self, *args, **kwargs):
        msg = Msg()
        user_id = self.get_argument('user', '')
        pass_word = self.get_argument('password', '')

        try:
            r = self.application.db.execute('''
                select password, role, name from user where id=?
            ''', (user_id, )).fetchone()
            if r:
                hash_pass_word = hash_str(user_id + pass_word)
                if hash_pass_word != r[0]:
                    msg.code = 2
                    msg.info = '密码错误！'
                else:
                    msg.code = r[1]
                    msg.data = r[2]
                    self.set_secure_cookie('userID', user_id)
            else:
                msg.code = 2
                msg.info = '用户不存在！'
        except Exception as e:
            msg.code = 2
            msg.info = e.args[0]
        self.write(json.dumps(msg.json()))
