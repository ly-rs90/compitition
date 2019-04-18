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
from .util import get_uuid


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
        if mode == 'get-count':
            content = self.get_argument('content', '').strip()
            try:
                count = self.application.db.execute('''
                    select count(*) from judge where content like '%{}%'
                '''.format(content)).fetchone()[0]
                msg.data = count
            except Exception as e:
                msg.code = 1
                msg.info = e.args[0]
        if mode == 'get-question':
            content = self.get_argument('content', '').strip()
            page = int(self.get_argument('page', 0))
            msg.data = []
            try:
                r = self.application.db.execute('''
                    select id, content, ans from judge where content like '%{}%' limit 30 offset ?
                '''.format(content), (page*30, )).fetchall()
                for n in r:
                    msg.data.append({
                        'id': n[0],
                        'content': n[1],
                        'ans': n[2]
                    })
            except Exception as e:
                msg.code = 1
                msg.info = e.args[0]
        if mode == 'add':
            content = self.get_argument('content', '').strip()
            ans = int(self.get_argument('ans', 0))
            if not content:
                msg.code = 1
                msg.info = '题目不能为空！'
            else:
                try:
                    self.application.db.execute('''
                        insert into judge (id, content, ans) values(?, ?, ?)
                    ''', (get_uuid(), content, ans))
                    self.application.db.commit()
                except Exception as e:
                    msg.code = 1
                    msg.info = e.args[0]
        if mode == 'del':
            _id = self.get_argument('id', '')
            try:
                self.application.db.execute('''
                    delete from judge where id=?
                ''', (_id, ))
                self.application.db.commit()
            except Exception as e:
                msg.code = 1
                msg.info = e.args[0]
        if mode == 'modify':
            _id = self.get_argument('id', '')
            content = self.get_argument('content', '').strip()
            ans = int(self.get_argument('ans', 0))
            if not content:
                msg.code = 1
                msg.info = '题目不能为空！'
            else:
                try:
                    self.application.db.execute('''
                        update judge set content=?, ans=? where id=?
                    ''', (content, ans, _id))
                    self.application.db.commit()
                except Exception as e:
                    msg.code = 1
                    msg.info = e.args[0]
        self.write(json.dumps(msg.json()))
