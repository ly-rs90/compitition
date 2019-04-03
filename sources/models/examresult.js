/**
 @name: examresult.js
 @editor: PyCharm
 @Date: 2019/4/1 17:12
 @Author: ly
 @Description:
 */
export const option1 = {
  grid: {x: 50, y: 60, x2: 50, y2: 40},
  tooltip: {trigger: 'axis'},
  xAxis: {name: '分数', data: (function () {
      let d = [];
      for (let i = 0; i <= 100; i++) {
        d.push(i);
      }
      return d;
    })()},
  yAxis: {
    name: '人数', boundaryGap: false
  },
  series: [
    {
      name: '人数',
      type: 'bar',
      data: []
    },
    {
      name: '人数',
      type: 'pie',
      center: ['80%', '25%'],
      radius: '28%',
      z: 100,
      label: {
        formatter: '{b}({c}人/{d}%)'
      },
      data: []
    }
  ]
};