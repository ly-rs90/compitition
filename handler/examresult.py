#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
@name: examresult.py
@editor: PyCharm
@Date: 2019/3/29 9:49
@Author: ly
@Description: 
"""
import json
from tornado.web import RequestHandler
from .msg import Msg
from .util import similar_simple


class ExamResult(RequestHandler):
    def post(self, *args, **kwargs):
        msg = Msg()
        mode = self.get_argument('mode')

        if mode == 'get-paper':
            try:
                r = self.application.db.execute('''
                    select name, table_name from paper_info where table_name in (select paper_id from exam_result group by paper_id)
                ''').fetchall()
                msg.data = []
                for n in r:
                    msg.data.append({'id': n[1], 'value': n[0]})
            except Exception as e:
                msg.code = 1
                msg.info = e.args[0]
        if mode == 'grade':
            paper_id = self.get_argument('id', '')
            question_type = {0: 'judge', 1: 'choice', 2: 'multi', 3: 'short'}
            question_value = {0: 0, 1: 0, 2: 0, 3: 0}
            user_scores = {}

            try:
                paper_info = self.application.db.execute('''
                    select judge_value, choice_value, multi_value, short_value, pass_score from paper_info where table_name=?
                ''', (paper_id, )).fetchone()

                # 获取试卷信息，判断题分值，选择题分值等等
                if not paper_info:
                    msg.code = 1
                    msg.info = '试卷信息丢失，无法评分！'
                    self.finish(json.dumps(msg.json()))
                    return
                question_value[0] = paper_info[0]
                question_value[1] = paper_info[1]
                question_value[2] = paper_info[2]
                question_value[3] = paper_info[3]
                pass_value = paper_info[4]

                # 获取试题信息
                question_info = {}
                question = self.application.db.execute('''select id, ans from {}'''.format(paper_id)).fetchall()
                for n in question:
                    question_info[n[0]] = n[1]

                # 获取考试用户
                user_info = self.application.db.execute('''select user_id from exam_result group by user_id''').fetchall()
                for n in user_info:
                    user_scores[n[0]] = {'judge': 0, 'choice': 0, 'multi': 0, 'short': 0}

                # 获取试卷考试结果
                paper_result = self.application.db.execute('''
                    select user_id, content_id, content_type, ans from exam_result where paper_id=?
                ''', (paper_id, )).fetchall()
                for n in paper_result:
                    if (n[2] == 0 or n[2] == 1 or n[2] == 2) and n[3] == question_info.get(n[1], ''):
                        user_scores[n[0]][question_type[n[2]]] += question_value[n[2]]
                    if n[2] == 3:
                        sim = similar_simple(question_info.get(n[1], '').strip(), n[3].strip())
                        user_scores[n[0]][question_type[n[2]]] += int(round(sim)*question_value[n[2]])

                # 结果存库
                for user in user_scores:
                    judge = user_scores[user]['judge']
                    choice = user_scores[user]['choice']
                    multi = user_scores[user]['multi']
                    short = user_scores[user]['short']
                    total = judge + choice + multi + short
                    if total >= pass_value:
                        pass_ = '及格'
                    else:
                        pass_ = '不及格'
                    try:
                        self.application.db.execute('''
                            insert into exam_score (user_id, paper_id, judge_score, choice_score, multi_score, short_score, total_score, pass)
                            values (?, ?, ?, ?, ?, ?, ?, ?)
                        ''', (user, paper_id, judge, choice, multi, short, total, pass_))
                    except:
                        try:
                            self.application.db.execute('''
                                update exam_score set judge_score=?, choice_score=?, multi_score=?, short_score=?, total_score=?, pass=?
                                where user_id=? and paper_id=?
                            ''', (judge, choice, multi, short, total, pass_, user, paper_id))
                            self.application.db.commit()
                        except:
                            pass
                self.application.db.commit()
            except Exception as e:
                msg.code = 1
                msg.info = e.args[0]
        if mode == 'get-score':
            paper_id = self.get_argument('id', '')
            msg.data = []
            try:
                self.application.db.execute('''delete from exam_start''')
                self.application.db.commit()
            except:
                pass

            try:
                r = self.application.db.execute('''
                    select a.name,b.user_id,b.judge_score,b.choice_score,b.multi_score,b.short_score,b.total_score,b.pass
                    from user a, exam_score b where a.id=b.user_id and b.paper_id=? order by b.total_score desc
                ''', (paper_id, ))
                for n, v in enumerate(r):
                    msg.data.append({
                        'index': n+1,
                        'name': v[0],
                        'id': v[1],
                        'judge': v[2],
                        'choice': v[3],
                        'multi': v[4],
                        'short': v[5],
                        'score': v[6],
                        'pass': v[7]
                    })
            except Exception as e:
                msg.code = 1
                msg.info = e.args[0]
        self.write(json.dumps(msg.json()))
