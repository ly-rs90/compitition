#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
@name: paperview.py
@editor: PyCharm
@Date: 2019/4/22 14:41
@Author: ly
@Description: 
"""
import json
from tornado.web import RequestHandler
from .msg import Msg


class PaperView(RequestHandler):
    def post(self, *args, **kwargs):
        msg = Msg()
        judge = eval(self.get_argument('judge', '[]'))
        choice = eval(self.get_argument('choice', '[]'))
        multi = eval(self.get_argument('multi', '[]'))
        short = eval(self.get_argument('short', '[]'))
        msg.data = {'judge': [], 'choice': [], 'multi': [], 'short': []}

        judge_str = '\'' + ','.join(judge).replace(',', '\',\'') + '\''
        choice_str = '\'' + ','.join(choice).replace(',', '\',\'') + '\''
        multi_str = '\'' + ','.join(multi).replace(',', '\',\'') + '\''
        short_str = '\'' + ','.join(short).replace(',', '\',\'') + '\''
        try:
            r = self.application.db.execute('''
                select content from judge where id in ({})
            '''.format(judge_str)).fetchall()
            for n in r:
                msg.data['judge'].append({'content': n[0]})

            r = self.application.db.execute('''
                select content, c1, c2, c3, c4 from choice where id in ({})
            '''.format(choice_str)).fetchall()
            for n in r:
                msg.data['choice'].append({'content': n[0], 'c1': n[1], 'c2': n[2], 'c3': n[3], 'c4': n[4]})

            r = self.application.db.execute('''
                select content, c1, c2, c3, c4 from multi_choice where id in ({})
            '''.format(multi_str)).fetchall()
            for n in r:
                msg.data['multi'].append({'content': n[0], 'c1': n[1], 'c2': n[2], 'c3': n[3], 'c4': n[4]})

            r = self.application.db.execute('''
                select content from short_answer where id in ({})
            '''.format(short_str)).fetchall()
            for n in r:
                msg.data['short'].append({'content': n[0]})
        except Exception as e:
            msg.code = 1
            msg.info = e.args[0]
        self.write(json.dumps(msg.json()))
