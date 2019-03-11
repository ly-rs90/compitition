#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
@name: paper.py
@editor: PyCharm
@Date: 2019/3/8 10:10
@Author: ly
@Description: 
"""
import json
import time
from tornado.web import RequestHandler
from .msg import Msg


class Paper(RequestHandler):
    def post(self, *args, **kwargs):
        paper_id = self.get_argument('paperID', '')
        now = int(time.time())
        msg = Msg()

        if paper_id:
            try:
                r = self.application.db.execute('''
                    select begin_time, end_time from paper_info where table_name=?
                ''', (paper_id, )).fetchone()
                if r and r[0] <= now <= r[1]:
                    msg.data = {'judge': [], 'choice': [], 'multi': [], 'short': []}
                    judge = []
                    choice = []
                    multi_choice = []
                    short_ans = []
                    m = self.application.db.execute('''
                        select id, type from {}
                    '''.format(paper_id)).fetchall()
                    for n in m:
                        if n[1] == 0:
                            judge.append(n[0])
                        if n[1] == 1:
                            choice.append(n[0])
                        if n[1] == 2:
                            multi_choice.append(n[0])
                        if n[1] == 3:
                            short_ans.append(n[0])

                    param = ','.join(judge).replace(',', '\',\'')
                    param = '\'' + param + '\''
                    r = self.application.db.execute('''
                        select id, content from judge where id in ({})
                    '''.format(param)).fetchall()
                    for n in r:
                        msg.data['judge'].append({'id': n[0], 'content': n[1]})

                    param = ','.join(choice).replace(',', '\',\'')
                    param = '\'' + param + '\''
                    r = self.application.db.execute('''
                        select id, content, c1, c2, c3, c4 from choice where id in ({})
                    '''.format(param)).fetchall()
                    for n in r:
                        msg.data['choice'].append({'id': n[0], 'content': n[1], 'c1': n[2],
                                                   'c2': n[3], 'c3': n[4], 'c4': n[5]})

                    param = ','.join(multi_choice).replace(',', '\',\'')
                    param = '\'' + param + '\''
                    r = self.application.db.execute('''
                        select id, content, c1, c2, c3, c4 from multi_choice where id in ({})
                    '''.format(param)).fetchall()
                    for n in r:
                        msg.data['multi'].append({'id': n[0], 'content': n[1], 'c1': n[2],
                                                  'c2': n[3], 'c3': n[4], 'c4': n[5]})

                    param = ','.join(short_ans).replace(',', '\',\'')
                    param = '\'' + param + '\''
                    r = self.application.db.execute('''
                        select id, content from short_answer where id in ({})
                    '''.format(param)).fetchall()
                    for n in r:
                        msg.data['short'].append({'id': n[0], 'content': n[1]})
                else:
                    msg.code = 1
                    msg.info = '考试已结束!'
            except Exception as e:
                msg.code = 1
                msg.info = e.args[0]
        else:
            msg.data = {'num': 0}
            try:
                r = self.application.db.execute('''
                    select name, table_name, begin_time, end_time from paper_info where begin_time<=? and end_time>=? 
                    and active=1
                ''', (now, now)).fetchall()
                msg.data['num'] = len(r)
                if msg.data['num'] >= 1:
                    msg.data['paper'] = []
                    for n in r:
                        msg.data['paper'].append({'name': n[0], 'id': n[1], 'bTime': n[2], 'eTime': n[3]})
            except Exception as e:
                msg.code = 1
                msg.info = e.args[0]
        self.write(json.dumps(msg.json()))
