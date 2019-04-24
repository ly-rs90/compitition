#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
@name: papermanager.py
@editor: PyCharm
@Date: 2019/3/7 10:08
@Author: ly
@Description: 
"""
import time
import json
from tornado.web import RequestHandler
from .msg import Msg


class PaperManager(RequestHandler):
    def get(self, *args, **kwargs):
        msg = Msg()
        msg.data = []
        try:
            r = self.application.db.execute('''
                select name, create_time, begin_time, end_time, total_value, pass_score, active, duration from paper_info
            ''').fetchall()
            for n in r:
                msg.data.append({
                    'name': n[0],
                    'cTime': time.strftime('%Y/%m/%d %X', time.localtime(n[1])),
                    'bTime': time.strftime('%Y/%m/%d %X', time.localtime(n[2])),
                    'eTime': time.strftime('%Y/%m/%d %X', time.localtime(n[3])),
                    'total': n[4],
                    'pass': n[5],
                    'active': n[6],
                    'duration': n[7]
                })
        except Exception as e:
            pass
        self.write(json.dumps(msg.json()))

    def post(self, *args, **kwargs):
        msg = Msg()
        _type = self.get_argument('type')
        name = self.get_argument('name', '')

        if _type == 'delete':
            try:
                r = self.application.db.execute('''
                    select  table_name from paper_info where name=?
                ''', (name,)).fetchone()
                self.application.db.execute('''
                    drop table {};
                '''.format(r[0]))
                self.application.db.execute('''
                    delete from paper_info where name=?
                ''', (name, ))
                self.application.db.commit()
            except Exception as e:
                msg.code = 1
                msg.info = e.args[0]
        if _type == 'update':
            b_time = self.get_argument('bTime', 0)
            e_time = self.get_argument('eTime', 0)
            pas = self.get_argument('pass', 0)
            active = self.get_argument('active', 0)
            duration = int(self.get_argument('duration', '90'))
            try:
                self.application.db.execute('''
                    update paper_info set begin_time=?,end_time=?,pass_score=?,active=?, duration=? where name=?
                ''', (b_time, e_time, pas, active, duration, name))
                self.application.db.commit()
            except Exception as e:
                msg.code = 1
                msg.info = e.args[0]
        self.write(json.dumps(msg.json()))
