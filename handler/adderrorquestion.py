#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
@name: adderrorquestion.py
@editor: PyCharm
@Date: 2020/2/5 12:33
@Author: ly
@Description: 向错题集添加错题
"""

def add_error_question(con, question_id, question_type, user_id):
    try:
        if question_id and question_type is not None and user_id:
            con.execute('''
                insert into error_book (question_id, question_type, user_id) values (?, ?, ?)
            ''', (question_id, question_type, user_id))
            con.commit()
    except:
        pass
