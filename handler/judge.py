#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
@name: judge.py
@editor: PyCharm
@Date: 2019/2/28 15:12
@Author: ly
@Description: 判断题
"""
import json
from tornado.web import RequestHandler
from .msg import Msg


class Judge(RequestHandler):
    def get(self, *args, **kwargs):
        con = self.get_argument('continue', False)
        count = self.get_argument('count', 0)
        start = self.get_argument('start', 0)
        try:
            total_count = self.application.db.execute('''select count(*) from judge''').fetchone()[0]
            r = self.application.db.execute('''select id, content from judge limit ? offset ?''', (count, start)).fetchall()
            data = []
            for n in r:
                data.append({'id': n[0], 'content': n[1]})
            if con:
                d = {
                    "data": data,
                    "pos": start,
                    "total_count": total_count
                }
            else:
                d = {
                    "data": data,
                    "pos": start,
                    "total_count": total_count
                }
            self.write(json.dumps(d))
        except Exception as e:
            d = {'data': [], 'pos': 0, 'total_count': 0}
            self.write(json.dumps(d))

    def post(self, *args, **kwargs):
        msg = Msg()
        mode = self.get_argument('mode', '')
        user = self.get_secure_cookie('userID').decode()

        if mode == 'train':
            msg.data = {}
            num = int(self.get_argument('num', 0))
            try:
                r = self.application.db.execute('''select id, content, ans from judge limit 1 offset ?''', (num, )) \
                    .fetchone()
                if r:
                    msg.data['id'] = r[0]
                    msg.data['content'] = r[1]
                    msg.data['ans'] = r[2]
                    self.application.db.execute('''
                        update answer_record set judge_num=? where user_id=?
                    ''', (num, user))
                    self.application.db.commit()
            except Exception as e:
                msg.code = 1
                msg.info = e.args[0]
        if mode == 'get-num':
            user = self.get_secure_cookie('userID').decode()
            try:
                r = self.application.db.execute('''
                    select judge_num from answer_record where user_id=?
                ''', (user, )).fetchone()
                if r:
                    msg.data = r[0]
                else:
                    self.application.db.execute('''
                        insert into answer_record (user_id, judge_num, choice_num, multi_num, short_num) values(?, ?, ?, ?, ?)
                    ''', (user, 0, 0, 0, 0))
                    self.application.db.commit()
                    msg.data = 0
            except Exception as e:
                msg.code = 1
                msg.info = e.args[0]
        self.write(json.dumps(msg.json()))
