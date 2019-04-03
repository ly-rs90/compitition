/**
 @name: examresult.js
 @editor: PyCharm
 @Date: 2019/3/7 15:49
 @Author: ly
 @Description:
 */
import * as webix from 'webix';
import {JetView} from 'webix-jet';
import {post} from '../models/post';
import {option1} from '../models/examresult';
import echarts from 'echarts'

let e1;
// 获取试卷
let getPaper = function () {
  post('/examresult', {mode: 'get-paper'}).then(function (r) {
    let res = r.json();
    if (res.code !== 0) {
      webix.alert(res.info);
    }
    else {
      let combo = $$('combo:paper');
      combo.define('options', res.data);
    }
  });
};

// 试卷打分
let grade = function (id) {
  return post('/examresult', {mode: 'grade', id: id});
};

// 获取考试结果
let getExamResult = function (id) {
  post('/examresult', {mode: 'get-score', id: id}).then(function (r) {
    let res = r.json();
    if (res.code !== 0) {
      webix.alert(res.info);
    }
    else {
      let t = $$('table:result');
      t.clearAll();
      t.define('data', res.data);
      let d = [];
      let pass = 0;
      let unPass = 0;
      for (let i = 0; i <= 100; i++) {
        d.push(0);
      }
      res.data.forEach(function (item) {
        d[item.score]++;
        if (item.pass === '及格') {
          pass++;
        }
        else {
          unPass++;
        }
      });
      e1.setOption({
        series: [
          {data: d},
          {
            data: [
              {
                name: '及格人数', value: pass,
                itemStyle: {color: '#18e681'}
              },
              {
                name: '不及格人数', value: unPass,
                itemStyle: {color: '#f9ba0a'}
              }
            ]
          }
        ]
      });
    }
  });
};

export default class ExamResult extends JetView {
  config() {
    return {
      rows: [
        {
          cols: [
            {width: 10},
            {
              view: 'combo', label: '试卷', labelWidth: 50, width: 220, id: 'combo:paper',
              on: {
                onChange: function (v) {
                  getExamResult(v);
                }
              }
            },
            {
              view: 'button', value: '评分', autowidth: 1,
              click: function () {
                let combo = $$('combo:paper');
                let v = combo.getValue();
                if (v) {
                  grade(v).then(function (r) {
                    let res = r.json();
                    if (res.code === 0) {
                      getExamResult(v);
                    }
                    else {
                      webix.alert(res.info);
                    }
                  });
                }
              }
            },
            // {view: 'button', value: '查询', autowidth: 1},
            {}
          ]
        },
        {
          view: 'tabview', tabbar: {optionWidth: 120},
          cells: [
            {
              header: '分数分布',
              body: {
                rows: [
                  {view: 'template', template: '', id: 'chart'}
                ]
              }
            },
            {
              header: '详细结果',
              body: {
                rows: [
                  {
                    cols: [
                      {},
                      {
                        view: 'button', label: '所有名单', width: 90, height: 60,
                        type: 'iconButtonTop', icon: 'fas fa-download',
                        click: function () {
                          let c = $$('combo:paper');
                          if (c.getValue()) {
                            webix.toExcel($$('table:result'), {
                              filename: c.getText() + '-所有名单', name: '成绩排名'
                            });
                          }
                        }
                      },
                      {width: 10},
                      {
                        view: 'button', label: '不合格名单', width: 90, type: 'iconButtonTop', icon: 'fas fa-download',
                        click: function () {
                          let c = $$('combo:paper');
                          if (c.getValue()) {
                            webix.toExcel($$('table:result'), {
                              filename: c.getText() + '-不合格名单', name: '成绩排名',
                              filter: function (obj) {
                                return obj.pass === '不及格';
                              }
                            });
                          }
                        }
                      },
                      {width: 10}
                    ]
                  },
                  {
                    view: 'datatable', scroll: 'y', id: 'table:result',
                    columns: [
                      {id: 'index', header: '名次', adjust: 1},
                      {id: 'name', header: '姓名', fillspace: 1.2},
                      {id: 'id', header: '员工号', fillspace: 1.2},
                      {id: 'judge', header: '判断题得分', fillspace: 1},
                      {id: 'choice', header: '单选题得分', fillspace: 1},
                      {id: 'multi', header: '多选题得分', fillspace: 1},
                      {id: 'short', header: '简答题得分', fillspace: 1},
                      {id: 'score', header: '总分', fillspace: 1},
                      {id: 'pass', header: '是否及格', fillspace: 1}
                    ]
                  }
                ]
              }
            }
          ]
        }
      ]
    };
  }
  init(_$view, _$) {
    e1 = echarts.init($$('chart').getNode());
    e1.setOption(option1);
    getPaper();
    window.onresize = function () {
      if (e1) {
        e1.resize();
      }
    };
  }
  ready(_$view, _$url) {
    $$('admin:menu').select('examresult');
  }
  destroy() {
    if (e1){
      e1.dispose();
    }
  }
}