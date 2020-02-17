#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
@name: errorbook.py
@editor: PyCharm
@Date: 2020/2/5 14:10
@Author: ly
@Description: 
"""
import json
from tornado.web import RequestHandler
from .msg import Msg
from .adderrorquestion import add_error_question


class ErrorBook(RequestHandler):
    def post(self):
        msg = Msg()
        user_id = self.get_secure_cookie('userID')
        if not user_id:
            msg.code = 1
            msg.info = '请登录！'
            self.write(json.dumps(msg.json()))
            return

        user_id = user_id.decode()
        _type = self.get_argument('type')
        if _type == 'add-question':
            question_id = self.get_argument('question_id')
            question_type = self.get_argument('question_type')
            add_error_question(self.application.db, question_id, question_type, user_id)
        if _type == 'get-question':
            msg.data = {'judge': [], 'choice': [], 'multi_choice': []}
            try:
                questions = {0: [], 1: [], 2: []}
                error_questions = self.application.db.execute('''
                    select question_id, question_type from error_book where user_id=? limit 100
                ''', (user_id,)).fetchall()
                for item in error_questions:
                    questions[item[1]].append(item[0])

                # 判断题
                for index, v in enumerate(questions[0]):
                    questions[0][index] = f"'{v}'"
                q_id = ','.join(questions[0])
                r = self.application.db.execute(f'''
                    select id, content, ans from judge where id in ({q_id})
                ''').fetchall()
                for item in r:
                    msg.data['judge'].append({'id': item[0], 'content': item[1], 'ans': item[2]})

                # 单选题
                for index, v in enumerate(questions[1]):
                    questions[1][index] = f"'{v}'"
                q_id = ','.join(questions[1])
                r = self.application.db.execute(f'''
                    select id, content, c1, c2, c3, c4, ans from choice where id in ({q_id})
                ''').fetchall()
                for item in r:
                    msg.data['choice'].append(
                        {'id': item[0], 'content': item[1], 'c1': item[2], 'c2': item[3], 'c3': item[4],
                         'c4': item[5], 'ans': item[6]})

                # 多选题
                for index, v in enumerate(questions[2]):
                    questions[2][index] = f"'{v}'"
                q_id = ','.join(questions[2])
                r = self.application.db.execute(f'''
                    select id, content, c1, c2, c3, c4, ans from multi_choice where id in ({q_id})
                ''').fetchall()
                for item in r:
                    msg.data['multi_choice'].append(
                        {'id': item[0], 'content': item[1], 'c1': item[2], 'c2': item[3], 'c3': item[4],
                        'c4': item[5], 'ans': item[6]})
            except Exception as e:
                msg.code = 1
                msg.info = e.args[0]
                msg.data = []
        if _type == 'remove-question':
            question_id = self.get_argument('question_id')
            try:
                self.application.db.execute('''
                    delete from error_book where user_id=? and question_id=?
                ''', (user_id, question_id))
                self.application.db.commit()
            except:
                pass
        self.write(json.dumps(msg.json()))
