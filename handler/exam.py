#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
@name: exam.py
@editor: PyCharm
@Date: 2019/3/25 11:57
@Author: ly
@Description: 
"""
import json
from tornado.web import RequestHandler
from .msg import Msg


class Exam(RequestHandler):
    def post(self, *args, **kwargs):
        msg = Msg()
        paper_id = self.get_argument('id', '')
        judge = eval(self.get_argument('judge', '[]'))
        choice = eval(self.get_argument('choice', '[]'))
        multi = eval(self.get_argument('multi', '[]'))
        short = eval(self.get_argument('short', '[]'))
        user = self.get_secure_cookie('userID').decode()
        temp1, temp2, temp3, temp4 = '', '', '', ''

        try:
            r = self.application.db.execute('''
                select user_id from exam_result where paper_id=? and user_id=? group by user_id
            ''', (paper_id, user)).fetchall()
            if len(r) > 0:
                msg.code = 1
                msg.info = '不能重复提交试卷！'
                self.finish(json.dumps(msg.json()))
                return
        except Exception as e:
            msg.code = 1
            msg.info = e.args[0]
            self.finish(json.dumps(msg.json()))
            return

        for n in judge:
            temp1 += '("{}", "{}", "{}", 0, "{}"),'.format(paper_id, user, n['id'], n['r'])

        for n in choice:
            temp2 += '("{}", "{}", "{}", 1, "{}"),'.format(paper_id, user, n['id'], n['r'])

        for n in multi:
            temp3 += '("{}", "{}", "{}", 2, "{}"),'.format(paper_id, user, n['id'], n['r'])

        for n in short:
            temp4 += '("{}", "{}", "{}", 3, "{}"),'.format(paper_id, user, n['id'], n['r'])

        temp = temp1 + temp2 + temp3 + temp4
        if temp.endswith(','):
            temp = temp[:-1]
        try:
            self.application.db.execute('''
                insert into exam_result (paper_id, user_id, content_id, content_type, ans) values {}
            '''.format(temp))
            self.application.db.execute('''
                delete from exam_start where user_id=?
            ''', (user, ))
            self.application.db.commit()
        except Exception as e:
            msg.code = 1
            msg.info = e.args[0]
        self.write(json.dumps(msg.json()))
