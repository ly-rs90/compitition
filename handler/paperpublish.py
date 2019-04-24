#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
@name: paperpublish.py
@editor: PyCharm
@Date: 2019/3/6 10:34
@Author: ly
@Description: 
"""
import json
import time
import uuid
from tornado.web import RequestHandler
from .msg import Msg


class PaperPublish(RequestHandler):
    def post(self, *args, **kwargs):
        msg = Msg()
        name = self.get_argument('name', '')
        judge = eval(self.get_argument('judge', '[]'))
        judge_value = int(self.get_argument('judgeValue', '0'))
        choice = eval(self.get_argument('choice', '[]'))
        choice_value = int(self.get_argument('choiceValue', '0'))
        multi_choice = eval(self.get_argument('multiChoice', '[]'))
        multi_value = int(self.get_argument('multiValue', '0'))
        short = eval(self.get_argument('shortAns', '[]'))
        short_value = int(self.get_argument('shortValue', '0'))
        pass_score = int(self.get_argument('passScore', '0'))
        total_score = int(self.get_argument('totalScore', '0'))
        duration = int(self.get_argument('duration', '90'))

        now = int(time.time())
        paper_id = uuid.uuid4().hex

        self.application.db.execute('''
        create table if not exists paper_{} (
            id text primary key not null,
            type integer check ( type in (0, 1, 2, 3) ),   -- 0: 判断，1：单选，2：多选，3：简答
            ans text not null
        );
        '''.format(paper_id))
        try:
            self.application.db.execute('''
                    insert into paper_info (name, table_name, create_time, begin_time, end_time, judge_value, choice_value, 
                    multi_value, short_value, total_value, pass_score, duration) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (name, 'paper_{}'.format(paper_id), now, now, now + 7200, judge_value, choice_value, multi_value, short_value, total_score, pass_score, duration))

            param1 = ','.join(judge).replace(',', '\',\'')
            param1 = '\'' + param1 + '\''

            param2 = ','.join(choice).replace(',', '\',\'')
            param2 = '\'' + param2 + '\''

            param3 = ','.join(multi_choice).replace(',', '\',\'')
            param3 = '\'' + param3 + '\''

            param4 = ','.join(short).replace(',', '\',\'')
            param4 = '\'' + param4 + '\''
            r1 = self.application.db.execute('''
                        select id, ans from judge where id in ({})
                        '''.format(param1)).fetchall()
            r2 = self.application.db.execute('''
                        select id, ans from choice where id in ({})
                        '''.format(param2)).fetchall()
            r3 = self.application.db.execute('''
                        select id, ans from multi_choice where id in ({})
                        '''.format(param3)).fetchall()
            r4 = self.application.db.execute('''
                        select id, ans from short_answer where id in ({})
                        '''.format(param4)).fetchall()
            if len(r1) != len(judge) or len(r2) != len(choice) or len(r3) != len(multi_choice) or len(r4) != len(short):
                self.application.db.rollback()
                msg.code = 1
                msg.info = '部分试题已被删除，请重新选题！'
            else:
                for n in r1:
                    self.application.db.execute('''
                            insert into paper_{} (id, type, ans) values (?, ?, ?)
                    '''.format(paper_id), (n[0], 0, n[1]))
                for n in r2:
                    self.application.db.execute('''
                            insert into paper_{} (id, type, ans) values (?, ?, ?)
                    '''.format(paper_id), (n[0], 1, n[1]))
                for n in r3:
                    self.application.db.execute('''
                            insert into paper_{} (id, type, ans) values (?, ?, ?)
                    '''.format(paper_id), (n[0], 2, n[1]))
                for n in r4:
                    self.application.db.execute('''
                            insert into paper_{} (id, type, ans) values (?, ?, ?)
                    '''.format(paper_id), (n[0], 3, n[1]))
                self.application.db.commit()
        except Exception as e:
            self.application.db.rollback()
            self.application.db.execute('''drop table paper_{}'''.format(paper_id))
            msg.code = 1
            msg.info = e.args[0]
        self.write(json.dumps(msg.json()))
