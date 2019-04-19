#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
@name: user.py
@editor: PyCharm
@Date: 2019/4/19 15:58
@Author: ly
@Description: 
"""
import json
from tornado.web import RequestHandler
from .util import hash_str
from .msg import Msg


class User(RequestHandler):
    def post(self, *args, **kwargs):
        msg = Msg()
        mode = self.get_argument('mode')
        if mode == 'get-count':
            content = self.get_argument('content', '').strip()
            try:
                count = self.application.db.execute('''
                    select count(*) from user where id like '%{}%' or name like '%{}%'
                '''.format(content, content)).fetchone()[0]
                msg.data = count
            except Exception as e:
                msg.code = 1
                msg.info = e.args[0]
        if mode == 'get-user':
            content = self.get_argument('content', '').strip()
            page = int(self.get_argument('page', 0))
            msg.data = []
            try:
                r = self.application.db.execute('''
                    select id, name, role from user where id like '%{}%' or name like '%{}%' limit 30 offset ?
                '''.format(content, content), (page*30, )).fetchall()
                for n in r:
                    msg.data.append({
                        'id': n[0],
                        'name': n[1],
                        'role': n[2]
                    })
            except Exception as e:
                msg.code = 1
                msg.info = e.args[0]
        if mode == 'del':
            _id = self.get_argument('id', '')
            try:
                self.application.db.execute('''
                    delete from user where id=?
                ''', (_id, ))
                self.application.db.commit()
            except Exception as e:
                msg.code = 1
                msg.info = e.args[0]
        if mode == 'modify':
            _id = self.get_argument('id', '')
            password = self.get_argument('password', '').strip()
            if not password:
                msg.code = 1
                msg.info = '姓名或者密码不能为空！'
            else:
                try:
                    self.application.db.execute('''
                        update user set password=? where id=?
                    ''', (hash_str(_id + password), _id))
                    self.application.db.commit()
                except Exception as e:
                    msg.code = 1
                    msg.info = e.args[0]
        self.write(json.dumps(msg.json()))
