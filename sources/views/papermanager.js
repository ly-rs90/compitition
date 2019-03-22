/**
 @name: papermanager.js
 @editor: PyCharm
 @Date: 2019/3/5 17:17
 @Author: ly
 @Description:
 */
import * as webix from 'webix';
import {JetView} from 'webix-jet';
import {post} from "../models/post";

export default class PaperManager extends JetView {
  config() {
    return {
      rows: [
        {
          view: 'form', id: 'form:info',
          elements: [
            {
              cols: [
                {
                  view: 'text', label: '试卷名称', labelWidth: 80, width: 300, readonly: 1, id: 'paper:name',
                  name: 'name',
                  on: {
                    onChange: function (v) {
                      if (v.length > 0) {
                        $$('save').enable();
                        $$('delete').enable();
                      }
                      else {
                        $$('save').disable();
                        $$('delete').disable();
                      }
                    }
                  }
                },
                {width: 10},
                {
                  view: 'datepicker', name: 'cTime', label: '创建时间', timepicker: 1, format: '%Y/%m/%d %H:%i',
                  labelWidth: 80, width: 300, readonly: 1
                },
                {width: 10},
                {
                  view: 'datepicker', name: 'bTime', label: '开考时间', timepicker: 1, format: '%Y/%m/%d %H:%i',
                  labelWidth: 80, width: 300
                },
                {}
              ]
            },
            {
              cols: [
                {
                  view: 'datepicker', name: 'eTime', label: '结束时间', timepicker: 1, format: '%Y/%m/%d %H:%i',
                  labelWidth: 80, width: 300
                },
                {width: 10},
                {view: 'text', label: '及格分数', labelWidth: 80, width: 300, name: 'pass'},
                {width: 10},
                {
                  view: 'checkbox', label: '是否启用', labelWidth: 80, width: 120, name: 'active'
                },
                {width: 10},
                {
                  view: 'button', value: '保存修改', width: 100, id: 'save', disabled: 1,
                  click: function () {
                    let form = $$('form:info');
                    if (!form.validate()) {
                      webix.alert('请检查无效数据！');
                    }
                    else {
                      let name = $$('form:info').getValues().name;
                      let bTime = $$('form:info').getValues().bTime.getTime()/1000;
                      let eTime = $$('form:info').getValues().eTime.getTime()/1000;
                      let pass = $$('form:info').getValues().pass;
                      let active = $$('form:info').getValues().active;
                      post('/papermanager', {type: 'update', name: name, bTime: bTime,
                        eTime: eTime, pass: pass, active: active}).then(function (r) {
                          let res = r.json();
                          if (res.code === 0) {
                            $$('paper:table').clearAll();
                            $$('paper:table').load('/papermanager');
                          }
                          else {
                            webix.alert('修改失败，原因：' + res.info);
                          }
                      });
                    }
                  }
                },
                {
                  view: 'button', value: '删除试卷', width: 100, id: 'delete', disabled: 1,
                  click: function () {
                    webix.confirm({text: '删除试卷可能造成考试成绩丢失，请确保您已经保存了该套试卷的考试结果！',
                      title: '操作提示', ok: '确定', cancel: '取消', callback: function (r) {
                        if (r) {
                          let name = $$('paper:name').getValue();
                          post('/papermanager', {type: 'delete', name: name}).then(function (r) {
                            let res = r.json();
                            if (res.code === 0) {
                              let table = $$('paper:table');
                              table.clearAll();
                              table.load('/papermanager');
                            }
                            else {
                              webix.alert('删除试卷失败，原因：' + res.info);
                            }
                          });
                        }
                      }
                    });
                  }
                },
                {}
              ]
            }
          ],
          rules: {
            pass: webix.rules.isNumber
          }
        },
        {
          view: 'datatable', id: 'paper:table', scroll: 'y', select: 'row',
          columns: [
            {id: 'index', header: '#', adjust: 1},
            {id: 'name', header: '试卷名称', fillspace: 1},
            {id: 'cTime', header: '创建时间', fillspace: 1},
            {id: 'bTime', header: '开考时间', fillspace: 1},
            {id: 'eTime', header: '结束时间', fillspace: 1},
            {id: 'total', header: '总分', adjust: 1},
            {id: 'pass', header: '及格分数', adjust: 1},
            {id: 'active', header: '是否启用', adjust: 1}
          ],
          scheme:{
            $init:function(obj){ obj.index = this.count(); }
          },
          url: '/papermanager'
        }
      ]
    };
  }
  init(_$view, _$) {
    $$('form:info').bind($$('paper:table'));
  }
  ready(_$view, _$url) {
    $$('admin:menu').select('papermanager');
  }
}