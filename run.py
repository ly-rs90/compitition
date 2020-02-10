#!/usr/bin/env python
# -*- coding: utf8 -*-

import sqlite3
import tornado.escape
import tornado.ioloop
import tornado.options
import tornado.web
import os.path
from handler.judge import Judge
from handler.choice import Choice
from handler.multichoice import MultiChoice
from handler.shortans import ShortAns
from handler.paperpublish import PaperPublish
from handler.papermanager import PaperManager
from handler.paper import Paper
from handler.register import Register
from handler.login import Login
from handler.exam import Exam
from handler.simulate import Simulate
from handler.examresult import ExamResult
from handler.user import User
from handler.paperview import PaperView
from handler.errorbook import ErrorBook

from tornado.options import define, options
define("port", default=80, help="run on the given port", type=int)
define("debug", default=True, help="debug mode", type=bool)

root = os.path.dirname(__file__)


class NoCacheStaticFileHandler(tornado.web.StaticFileHandler):
    def set_extra_headers(self, path):
        # Disable cache
        self.set_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')


class Application(tornado.web.Application):
    def __init__(self):
        self.db = sqlite3.connect('data.db')
        handlers = [
            (r'/errorbook', ErrorBook),
            (r'/register', Register),
            (r'/paperview', PaperView),
            (r'/user', User),
            (r'/login', Login),
            (r'/simulate', Simulate),
            (r'/exam', Exam),
            (r'/examresult', ExamResult),
            (r'/judge', Judge),
            (r'/paper', Paper),
            (r'/paperpublish', PaperPublish),
            (r'/papermanager', PaperManager),
            (r'/shortans', ShortAns),
            (r'/multichoice', MultiChoice),
            (r'/choice', Choice),
            (r"/(.*)$", tornado.web.StaticFileHandler if not options.debug else NoCacheStaticFileHandler,
             {"path": root, "default_filename": "index.html"})
        ]

        settings = dict(
            cookie_secret='Tpmlb5C2SQ6BFnDW124cz9ca1ZSxt0G6sUaisseby0g=',
            debug=True,
        )
        tornado.web.Application.__init__(self, handlers, **settings)


def main():
    tornado.options.parse_command_line()
    app = Application()
    app.listen(options.port)
    try:
        with open('./sql/create.sql', 'r', encoding='utf-8') as t:
            sql_str = t.read()
            app.db.executescript(sql_str)
        print('服务启动成功！')
        tornado.ioloop.IOLoop.instance().start()
    except KeyboardInterrupt:
        tornado.ioloop.IOLoop.instance().stop()
    except Exception as e:
        print('错误信息：' + e.args[0])


if __name__ == "__main__":
    main()

