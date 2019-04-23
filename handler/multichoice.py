#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
@name: multichoice.py
@editor: PyCharm
@Date: 2019/3/1 11:14
@Author: ly
@Description: 多选
"""
import json
from tornado.web import RequestHandler
from .msg import Msg
from .util import get_uuid


class MultiChoice(RequestHandler):
    def get(self, *args, **kwargs):
        con = self.get_argument('continue', False)
        count = self.get_argument('count', 0)
        start = self.get_argument('start', 0)
        try:
            total_count = self.application.db.execute('''select count(*) from multi_choice where use=1''').fetchone()[0]
            r = self.application.db.execute('''
                select id, content from multi_choice where use=1 limit ? offset ?
            ''', (count, start)).fetchall()
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
                sql_str = '''select content, c1, c2, c3, c4, ans from multi_choice limit 1 offset ?'''
                r = self.application.db.execute(sql_str, (num,)).fetchone()
                if r:
                    msg.data['content'] = r[0]
                    msg.data['c1'] = r[1]
                    msg.data['c2'] = r[2]
                    msg.data['c3'] = r[3]
                    msg.data['c4'] = r[4]
                    msg.data['ans'] = r[5]
                    self.application.db.execute('''
                        update answer_record set multi_num=? where user_id=?
                    ''', (num, user))
                    self.application.db.commit()
            except Exception as e:
                msg.code = 1
                msg.info = e.args[0]
        if mode == 'get-num':
            try:
                r = self.application.db.execute('''
                    select multi_num from answer_record where user_id=?
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
                    select count(*) from multi_choice where content like '%{}%'
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
                    select id, content, c1, c2, c3, c4, ans, use from multi_choice where content like '%{}%' limit 30 offset ?
                '''.format(content), (page*30, )).fetchall()
                for n in r:
                    msg.data.append({
                        'id': n[0],
                        'content': n[1],
                        'c1': n[2],
                        'c2': n[3],
                        'c3': n[4],
                        'c4': n[5],
                        'ans': n[6],
                        'use': n[7]
                    })
            except Exception as e:
                msg.code = 1
                msg.info = e.args[0]
        if mode == 'add':
            content = self.get_argument('content', '').strip()
            c1 = self.get_argument('c1', '').strip()
            c2 = self.get_argument('c2', '').strip()
            c3 = self.get_argument('c3', '').strip()
            c4 = self.get_argument('c4', '').strip()
            ans = self.get_argument('ans', '1')
            if not content:
                msg.code = 1
                msg.info = '题目不能为空！'
            else:
                try:
                    self.application.db.execute('''
                        insert into multi_choice (id, content, c1, c2, c3, c4, ans) values(?, ?, ?, ?, ?, ?, ?)
                    ''', (get_uuid(), content, c1, c2, c3, c4, ans))
                    self.application.db.commit()
                except Exception as e:
                    msg.code = 1
                    msg.info = e.args[0]
        if mode == 'del':
            _id = eval(self.get_argument('id', '[]'))
            id_str = '\'' + ','.join(_id).replace(',', '\',\'') + '\''
            try:
                self.application.db.execute('''
                    delete from multi_choice where id in ({})
                '''.format(id_str))
                self.application.db.commit()
            except Exception as e:
                msg.code = 1
                msg.info = e.args[0]
        if mode == 'modify':
            _id = self.get_argument('id', '')
            content = self.get_argument('content', '').strip()
            c1 = self.get_argument('c1', '').strip()
            c2 = self.get_argument('c2', '').strip()
            c3 = self.get_argument('c3', '').strip()
            c4 = self.get_argument('c4', '').strip()
            ans = self.get_argument('ans', '1')
            if not content:
                msg.code = 1
                msg.info = '题目不能为空！'
            else:
                try:
                    self.application.db.execute('''
                        update multi_choice set content=?, ans=?, c1=?, c2=?, c3=?, c4=? where id=?
                    ''', (content, ans, c1, c2, c3, c4, _id))
                    self.application.db.commit()
                except Exception as e:
                    msg.code = 1
                    msg.info = e.args[0]
        if mode == 'use-question':  # 批量启用/禁用试题
            use = int(self.get_argument('use', '1'))
            _id = eval(self.get_argument('id', '[]'))
            id_str = '\'' + ','.join(_id).replace(',', '\',\'') + '\''
            try:
                self.application.db.execute('''
                    update multi_choice set use=? where id in ({})
                '''.format(id_str), (use, ))
                self.application.db.commit()
            except Exception as e:
                msg.code = 1
                msg.info = e.args[0]
        self.write(json.dumps(msg.json()))
