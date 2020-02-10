#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
@name: simulate.py
@editor: PyCharm
@Date: 2019/3/25 16:22
@Author: ly
@Description: 
"""
import json
import math
import time
from tornado.web import RequestHandler
from .msg import Msg
from .util import similar_simple
from .adderrorquestion import add_error_question


class Simulate(RequestHandler):
    def post(self, *args, **kwargs):
        msg = Msg()
        _type = self.get_argument('type')
        if _type == 'get-paper':
            msg.data = {'judge': [], 'choice': [], 'multi': [], 'short': []}
            try:
                # 判断题20个
                r = self.application.db.execute('''
                        select id, content, ans from judge order by random() limit 20
                    ''').fetchall()
                for n in r:
                    msg.data['judge'].append({'id': n[0], 'content': n[1], 'ans': n[2]})
                # 选择题20个
                r = self.application.db.execute('''
                        select id, content, c1, c2, c3, c4, ans from choice order by random() limit 20
                    ''').fetchall()
                for n in r:
                    msg.data['choice'].append({'id': n[0], 'content': n[1], 'c1': n[2], 'c2': n[3], 'c3': n[4], 'c4': n[5], 'ans': n[6]})
                # 多选题15个
                r = self.application.db.execute('''
                        select id, content, c1, c2, c3, c4, ans from multi_choice order by random() limit 15
                    ''').fetchall()
                for n in r:
                    msg.data['multi'].append({'id': n[0], 'content': n[1], 'c1': n[2], 'c2': n[3], 'c3': n[4], 'c4': n[5], 'ans': n[6]})
                # 简答题6个
                r = self.application.db.execute('''
                        select id, content, ans from short_answer order by random() limit 6
                    ''').fetchall()
                for n in r:
                    msg.data['short'].append({'id': n[0], 'content': n[1], 'ans': n[2]})
                self.finish(json.dumps(msg.json()))
                return
            except Exception as e:
                msg.code = 1
                msg.info = e.args[0]
                self.finish(json.dumps(msg.json()))
                return
        if _type == 'post-paper':
            short = eval(self.get_argument('short', '[]'))
            short_ans = {}
            short_id = []
            for n in short:
                short_id.append(n['id'])
            short_id_str = ','.join(short_id)
            short_id_str = short_id_str.replace(',', '","')
            short_id_str = '"' + short_id_str + '"'

            try:
                r = self.application.db.execute('''
                    select id, ans from short_answer where id in ({})
                '''.format(short_id_str)).fetchall()
                for n in r:
                    short_ans[n[0]] = n[1]
                result = []
                for n in short:
                    sim = similar_simple(short_ans[n['id']].strip(), n['r'].strip())
                    result.append({'id': n['id'], 'score': int(round(sim*6))})
                msg.data = result
            except Exception as e:
                msg.code = 1
                msg.info = e.args[0]
        # 添加错题
        if _type == 'add-error-question':
            question_id = self.get_argument('question_id', None)
            question_type = self.get_argument('question_type', None)
            user_id = self.get_secure_cookie('userID').decode()
            if question_id and question_type is not None:
                add_error_question(self.application.db, question_id, question_type, user_id)
        self.write(json.dumps(msg.json()))
