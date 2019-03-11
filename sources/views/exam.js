/**
 @name: exam.js
 @editor: PyCharm
 @Date: 2019/2/28 10:11
 @Author: ly
 @Description:
 */
import * as webix from 'webix';
import {JetView} from 'webix-jet';
import {post} from '../models/post';

export default class Exam extends JetView {
  config() {
    return {
      cols: [
        {css: 'judge-bg'},
        {
          width: 800,
          view: 'scrollview', scroll: 'y', borderless: 1, css: 'judge-bg',
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
    post('/paper').then(function (r) {
      let res = r.json();
      if (res.code !== 0) {
        webix.alert('错误提示：' + res.info);
        return;
      }
      let p = $$('paper:question');
      if (res.data.num === 0) {
        p.addView({
          rows: [
            {},{view: 'label', label: '当前时间点没有考试！', align: 'center'},{}
          ]
        });
      }
      if (res.data.num >= 1) {
        let data = [];
        let len = res.data.paper.length;
        res.data.paper.forEach(function (item) {
          let bTime = new Date(item.bTime*1000);
          let eTime = new Date(item.eTime*1000);
          let bMin = bTime.getMinutes()>9?bTime.getMinutes():'0'+bTime.getMinutes();
          let eMin = eTime.getMinutes()>9?eTime.getMinutes():'0'+eTime.getMinutes();
          data.push({id: item.id, name: item.name,
            time: bTime.toLocaleDateString()+ ' ' + bTime.getHours() + ':' + bMin + ' ~ ' +
              eTime.toLocaleDateString()+ ' ' + eTime.getHours() + ':' + eMin});
        });
        p.addView({
          type: 'wide',
          rows: [
            {view: 'template', template: `当前时间点有${len}个考试，请选择！`, type: 'header', borderless: 1},
            {
              view: 'list', borderless: 1, type: {height: 80}, autoheight: 1, select: 1,
              template: "<div style='color:#555;font-size:20px;'>#name#</div><div>考试时间：#time#</div>",
              data: data,
              on: {
                onItemClick: function (id) {
                  post('/paper', {paperID: id}).then(function (r1) {
                    let res = r1.json();
                    if (res.code !== 0) {
                      webix.alert(res.info);
                    }
                    else {
                      let c = p.getChildViews()[0];
                      p.removeView(c);
                      res.data.judge.forEach(function (item) {
                        p.addView({
                          rows: [
                            {
                              css: 'white-bg',
                              rows: [
                                {height: 20},
                                {view: 'template', template: item.content, borderless: 1, autoheight: 1},
                                {height: 20},
                                {
                                  cols: [
                                    {},
                                    {
                                      view: 'radio', label: '', width: 140, align: 'center', id: item.id, options: [
                                        {id: '0', value: '错'},
                                        {id: '1', value: '对'}
                                      ],
                                    },
                                    {}
                                  ]
                                }
                              ]
                            }
                          ]
                        });
                      });
                      res.data.choice.forEach(function (item) {
                        p.addView({
                          css: 'white-bg',
                          rows: [
                            {height: 20},
                            {view: 'template', template: item.content, borderless: 1, autoheight: 1},
                            {height: 20},
                            {
                              view: 'radio', label: '', id: item.id, vertical: 1,
                              options: [
                                {id: '1', value: 'A、' + item.c1},
                                {id: '2', value: 'B、' + item.c2},
                                {id: '3', value: 'C、' + item.c3},
                                {id: '4', value: 'D、' + item.c4}
                              ],
                            }
                          ]
                        });
                      });
                    }
                  });
                }
              }
            }
          ]
        });
      }
    });
  }
}