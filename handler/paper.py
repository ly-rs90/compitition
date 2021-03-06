#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
@name: paper.py
@editor: PyCharm
@Date: 2019/3/8 10:10
@Author: ly
@Description: 
"""
import random
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
                    select begin_time, end_time, duration from paper_info where table_name=?
                ''', (paper_id, )).fetchone()
                if r and r[0] <= now <= r[1]:
                    msg.data = {'judge': [], 'choice': [], 'multi': [], 'short': [], 'time': '', 'duration': r[2]}
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
                        select id, content, ans from judge where id in ({})
                    '''.format(param)).fetchall()
                    for n in r:
                        msg.data['judge'].append({'id': n[0], 'content': n[1], 'ans': n[2]})
                    for _ in range(len(r)//2):
                        num1 = random.randint(0, len(r) - 1)
                        num2 = random.randint(0, len(r) - 1)
                        msg.data['judge'][num1], msg.data['judge'][num2] = msg.data['judge'][num2], msg.data['judge'][num1]

                    param = ','.join(choice).replace(',', '\',\'')
                    param = '\'' + param + '\''
                    r = self.application.db.execute('''
                        select id, content, c1, c2, c3, c4, ans from choice where id in ({})
                    '''.format(param)).fetchall()
                    for n in r:
                        msg.data['choice'].append({'id': n[0], 'content': n[1], 'c1': n[2],
                                                   'c2': n[3], 'c3': n[4], 'c4': n[5], 'ans': n[6]})
                    for _ in range(len(r)//2):
                        num1 = random.randint(0, len(r) - 1)
                        num2 = random.randint(0, len(r) - 1)
                        msg.data['choice'][num1], msg.data['choice'][num2] = msg.data['choice'][num2], msg.data['choice'][num1]

                    param = ','.join(multi_choice).replace(',', '\',\'')
                    param = '\'' + param + '\''
                    r = self.application.db.execute('''
                        select id, content, c1, c2, c3, c4, ans from multi_choice where id in ({})
                    '''.format(param)).fetchall()
                    for n in r:
                        msg.data['multi'].append({'id': n[0], 'content': n[1], 'c1': n[2],
                                                  'c2': n[3], 'c3': n[4], 'c4': n[5], 'ans': n[6]})
                    for _ in range(len(r)//2):
                        num1 = random.randint(0, len(r) - 1)
                        num2 = random.randint(0, len(r) - 1)
                        msg.data['multi'][num1], msg.data['multi'][num2] = msg.data['multi'][num2], msg.data['multi'][num1]

                    param = ','.join(short_ans).replace(',', '\',\'')
                    param = '\'' + param + '\''
                    r = self.application.db.execute('''
                        select id, content, ans from short_answer where id in ({})
                    '''.format(param)).fetchall()
                    for n in r:
                        msg.data['short'].append({'id': n[0], 'content': n[1], 'ans': n[2]})
                    for _ in range(len(r)//2):
                        num1 = random.randint(0, len(r) - 1)
                        num2 = random.randint(0, len(r) - 1)
                        msg.data['short'][num1], msg.data['short'][num2] = msg.data['short'][num2], msg.data['short'][num1]

                    user = self.get_secure_cookie('userID').decode()
                    time_start = int(self.get_argument('time'))
                    r = self.application.db.execute('''
                        select user_id from exam_start where user_id=?
                    ''', (user,)).fetchall()
                    if len(r) < 1:
                        self.application.db.execute('''
                            insert into exam_start (user_id, time_client, time_server) values (?, ?, ?)
                        ''', (user, time_start, int(time.time())))
                    r = self.application.db.execute('''
                        select time_client from exam_start where user_id=?
                    ''', (user, )).fetchone()
                    msg.data['time'] = r[0]
                    self.application.db.commit()
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
