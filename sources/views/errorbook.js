/**
 @name: errorbook.js
 @editor: PyCharm
 @Date: 2020/2/5 13:29
 @Author: ly
 @Description:
 */
import {JetView} from 'webix-jet';
import {post} from '../models/post';
import * as webix from 'webix';

export default class ErrorBook extends JetView {
  config() {
    return {
      cols: [
        {
          css: 'judge-bg',
          view: 'scrollview', scroll: 'y', borderless: 1,
          body: {
            type: 'wide', id: 'question:num', css: 'judge-bg',
            rows: []
          }
        },
        {
          width: 800,
          view: 'scrollview', scroll: 'y', borderless: 1, css: 'judge-bg', id: 'scroll:question',
          body: {
            type: 'wide', id: 'paper:question', css: 'judge-bg',
            rows: []
          }

        },
        {css: 'judge-bg'}
      ]
    };
  }
  init(_$view, _$) {
    $$('home:title').define('label', '<span style="color: #fff;font-size: 16px;">错题回顾</span>');
    $$('home:title').refresh();
    let jump = function() {
      let num = this.config.value;
      $$('scroll:question').showView(num + '_panel');
    };
    post('/errorbook', {type: 'get-question'}).then(function (r) {
      let result = r.json();
      let totalNum = result.data['judge'].length + result.data['choice'].length + result.data['multi_choice'].length;
      let questionNum = $$('question:num');
      let paper = $$('paper:question');
      questionNum.addView({view: 'label', label: '<span style="color: #09ad5a">题目序号</span>', align: 'center'});
      for (let i = 0; i < Math.ceil(totalNum/4); i++) {
        questionNum.addView({
          cols: [
            {},
            {view: 'button', with: 30, value: `${i*4+1}`, click: jump},
            i*4+2 > totalNum? {}: {view: 'button', with: 30, value: `${i*4+2}`, click: jump},
            i*4+3 > totalNum? {}: {view: 'button', with: 30, value: `${i*4+3}`, click: jump},
            i*4+4 > totalNum? {}: {view: 'button', with: 30, value: `${i*4+4}`, click: jump},
            {}
          ]
        });
      }
      questionNum.addView({height: 5});
      let index = 1;
      let papers = {type: 'wide', rows: []};
      papers.rows.push({height: 5});
      // 添加判断题
      result.data['judge'].forEach(function (item) {
        papers.rows.push({
          id: index + '_panel',
          rows: [
            {
              css: 'white-bg question-panel',
              rows: [
                {template: '', css: 'question-tip'},
                {template: '判断', css: 'question-type'},
                {view: 'template', template: '', css: 'result-type', borderless: 1, id: item.id + '_judge', hidden: 1},
                {view: 'template', template: `第${index++}题：` + item.content, borderless: 1, height: 100, css: 'question-content'},
                {
                  height: 40,
                  cols: [
                    {},
                    {
                      view: 'radio', label: '', width: 140, align: 'center', id: item.id, options: [
                        {id: '0', value: '错'},
                        {id: '1', value: '对'}
                      ],
                      on: {
                        onChange: function (newv) {
                          let f = false;
                          let question_id = item.id;
                          let ans_str = ['错', '对'];
                          result.data['judge'].forEach(function (v) {
                            if (v.id === question_id && newv == item.ans) {
                              f = true;
                            }
                          });
                          if (f) {
                            post('/errorbook', {type: 'remove-question', question_id: question_id});
                          }else {
                            webix.alert(`回答错误！正确答案是：${ans_str[item.ans]}`);
                          }
                        }
                      }
                    },
                    {}
                  ]
                },
                {height: 10}
              ]
            }
          ]
        });
      });
      // 添加多选题
      result.data['multi_choice'].forEach(function (item) {
        papers.rows.push({
          css: 'white-bg question-panel', id: index + '_panel',
          rows: [
            {template: '', css: 'question-tip'},
            {template: '多选', css: 'question-type'},
            {view: 'template', template: '', css: 'result-type', borderless: 1, id: item.id + '_multi', hidden: 1},
            {view: 'template', template: `第${index++}题：` + item.content, borderless: 1, autoheight: 1, css: 'question-content'},
            {
              view: 'form', id: item.id, borderless: 1,
              elements: [
                {view: 'checkbox', label: '', name: 'a', labelWidth: 0, labelRight: 'A、' + item.c1},
                {view: 'checkbox', label: '', name: 'b', labelWidth: 0, labelRight: 'B、' + item.c2},
                {view: 'checkbox', label: '', name: 'c', labelWidth: 0, labelRight: 'C、' + item.c3},
                {view: 'checkbox', label: '', name: 'd', labelWidth: 0, labelRight: 'D、' + item.c4},
              ]
            },
            {
              cols: [
                {},
                {
                  view: 'button', value: '确定', width: 200,
                  click: function () {
                    let formValue = $$(item.id).getValues();
                    let userAns = '';
                    if (formValue.a) userAns += '1';
                    if (formValue.b) userAns += '2';
                    if (formValue.c) userAns += '3';
                    if (formValue.d) userAns += '4';
                    if (userAns === item.ans) {
                      post('/errorbook', {type: 'remove-question', question_id: item.id});
                      webix.alert(`回答正确！`);
                    }else{
                      let ansStr = item.ans.replace('1', 'A').
                      replace('2', 'B').
                      replace('3', 'C').
                      replace('4', 'D');
                      webix.alert(`回答错误！正确答案是：${ansStr}`);
                    }
                  }
                },
                {}
              ]
            }
          ]
        });
      });
      // 添加单选题
      result.data['choice'].forEach(function (item) {
        papers.rows.push({
          css: 'white-bg question-panel', id: index + '_panel',
          rows: [
            {template: '', css: 'question-tip'},
            {template: '单选', css: 'question-type'},
            {view: 'template', template: '', css: 'result-type', borderless: 1, id: item.id + '_choice', hidden: 1},
            {view: 'template', template: `第${index++}题：` + item.content, borderless: 1, autoheight: 1, css: 'question-content'},
            {
              cols: [
                {width: 10},
                {
                  view: 'radio', label: '', id: item.id, vertical: 1,
                  options: [
                    {id: '1', value: 'A、' + item.c1},
                    {id: '2', value: 'B、' + item.c2},
                    {id: '3', value: 'C、' + item.c3},
                    {id: '4', value: 'D、' + item.c4}
                  ],
                  on: {
                    onChange: function (newv) {
                      let f = false;
                      let question_id = item.id;
                      let ans_str = ['A', 'B', 'C', 'D'];
                      result.data['choice'].forEach(function (v) {
                        if (v.id === question_id && item.ans == newv) {
                          f = true;
                        }
                      });
                      if (f) {
                        post('/errorbook', {type: 'remove-question', question_id: question_id});
                      }else {
                        webix.alert(`回答错误！正确答案是：${ans_str[item.ans-1]}`);
                      }
                    }
                  }
                }
              ]
            }
          ]
        });
      });
      papers.rows.push({height: 5});
      paper.addView(papers);
    });
  }
}