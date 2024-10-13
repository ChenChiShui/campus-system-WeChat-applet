import * as echarts from '../../miniprogram_npm/ec-canvas/echarts';
import { formatDate } from '../utils/utils';  

Page({
  data: {
    ec1: {
      lazyLoad: true
    },
    ec2: {
      lazyLoad: true
    },
    ec3: {
      lazyLoad: true
    },
    ec4: {
      lazyLoad: true
    },
    ec5: {
      lazyLoad: true
    },
    jobCount: 0,
    userCount: 0,
    jobByTime: [],
    jobByCategory: [],
    resumesByDay: [],
    popularJobs: [] // 最火的岗位数据
  },
  
  onLoad() {
    this.getStatistics();  // 页面加载时获取统计数据
  },

  // 获取统计数据
  getStatistics() {
    const db = wx.cloud.database();
    const jobDetail = db.collection('jobDetail');
    const infoCollection = db.collection('info');
  
    // 获取招聘信息总数
    jobDetail.count().then(res => {
      const jobCount = res.total;
      this.setData({ jobCount });
  
      // 获取用户总数 (通过 aggregate 进行统计)
      return infoCollection.aggregate()
        .group({
          _id: null,  // 对整个集合进行分组
          totalUsers: db.command.aggregate.sum(1)  // 统计用户数
        })
        .end();
    }).then(res => {
      const userCount = res.list[0]?.totalUsers || 0;
      this.setData({ userCount });
  
      // 获取按天统计的招聘信息数据
      return jobDetail.aggregate()
        .addFields({
          day: db.command.aggregate.dateToString({ format: '%Y-%m-%d', date: db.command.aggregate.toDate('$date') })
        })
        .group({
          _id: '$day',
          count: db.command.aggregate.sum(1)
        })
        .sort({
          _id: 1
        })
        .end();
    }).then(res => {
      this.setData({
        jobByTime: res.list.map(item => ({ time: item._id, count: item.count }))
      });
  
      // 获取按类别统计的招聘信息数据
      return jobDetail.aggregate()
        .group({
          _id: '$tagName',
          count: db.command.aggregate.sum(1)
        })
        .sort({
          count: -1
        })
        .end();
    }).then(res => {
      this.setData({
        jobByCategory: res.list.map(item => ({ category: item._id, count: item.count }))
      });
  
      // 从 jobDocList 中获取每日投递简历数量
      return jobDetail.aggregate()
        .unwind('$jobDocList')
        .addFields({
          day: db.command.aggregate.dateToString({ format: '%Y-%m-%d', date: db.command.aggregate.toDate('$jobDocList.date') })
        })
        .group({
          _id: '$day',
          count: db.command.aggregate.sum(1)
        })
        .sort({
          _id: 1
        })
        .end();
    }).then(res => {
      this.setData({
        resumesByDay: res.list.map(item => ({ time: item._id, count: item.count }))
      });
  
      // 获取最火岗位（按投递简历数量排序）
      return jobDetail.aggregate()
        .project({
          title: 1,  // 选择需要的字段
          docCount: db.command.aggregate.cond({
            if: db.command.aggregate.isArray('$jobDocList'),   // 确保 jobDocList 是数组
            then: db.command.aggregate.size('$jobDocList'),   // 计算数组长度
            else: 0  // 如果 jobDocList 不是数组，则返回 0
          })
        })
        .sort({
          docCount: -1   // 按简历投递数量倒序
        })
        .limit(10)  // 只取前 10 个
        .end();
    }).then(res => {
      this.setData({
        popularJobs: res.list.map(item => ({ title: item.title, count: item.docCount }))
      });
  
      // 确保数据加载完成后初始化所有图表
      this.initCharts();
    }).catch(err => {
      console.error("数据获取失败：", err);
    });
  },

  // 初始化所有图表
  initCharts() {
    this.initChart1();
    this.initChart2();
    this.initChart3();
    this.initChart4();
    this.initChart5();
  },

  // 初始化第一个图表：招聘信息与用户统计
  initChart1() {
    const ecComponent = this.selectComponent('#mychart-dom-bar');
    ecComponent.init((canvas, width, height, dpr) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr
      });

      const option = {
        title: {
          text: '招聘信息与用户统计'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          show: false
        },
        xAxis: {
          type: 'category',
          data: ['招聘信息', '用户']
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: '数量',
          type: 'bar',
          data: [this.data.jobCount, this.data.userCount],
          itemStyle: {
            color: '#83bff6'
          }
        }]
      };

      chart.setOption(option);
      return chart;
    });
  },

  // 初始化第二个图表：招聘信息按时间统计
  initChart2() {
    const ecComponent = this.selectComponent('#mychart-dom-time');
    ecComponent.init((canvas, width, height, dpr) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr
      });

      const option = {
        title: {
          text: '招聘信息按时间统计'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: this.data.jobByTime.map(item => item.time)
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: '数量',
          type: 'line',
          data: this.data.jobByTime.map(item => item.count),
          itemStyle: {
            color: '#ff7f50'
          }
        }]
      };

      chart.setOption(option);
      return chart;
    });
  },

  // 初始化第三个图表：招聘信息按类别统计
  initChart3() {
    const ecComponent = this.selectComponent('#mychart-dom-category');
    ecComponent.init((canvas, width, height, dpr) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: Math.max(height, this.data.jobByCategory.length * 20),
        devicePixelRatio: dpr
      });

      const option = {
        title: {
          text: '招聘信息按类别统计'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          show: false 
        },
        grid: {
          left: '10%',
          right: '10%',
          bottom: 80,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: this.data.jobByCategory.map(item => item.category),
          axisLabel: {
            interval: 0,
            rotate: 45,
            formatter: function (value) {
              return value.length > 5 ? value.slice(0, 5) + '...' : value;
            }
          }
        },
        yAxis: {
          type: 'value',
          name: ''
        },
        series: [{
          name: '数量',
          type: 'bar',
          data: this.data.jobByCategory.map(item => item.count),
          itemStyle: {
            color: '#87cefa'
          }
        }],
        dataZoom: [
          {
            type: 'slider',
            show: true,
            xAxisIndex: [0],
            start: 0,
            end: 100
          }
        ]
      };

      chart.setOption(option);
      return chart;
    });
  },

  // 初始化第四个图表：每日投递简历数量
  initChart4() {
    const ecComponent = this.selectComponent('#mychart-dom-resume');
    ecComponent.init((canvas, width, height, dpr) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr
      });

      const option = {
        title: {
          text: '每日投递简历数量'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: this.data.resumesByDay.map(item => item.time)
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: '数量',
          type: 'line',
          data: this.data.resumesByDay.map(item => item.count),
          itemStyle: {
            color: '#ff7f50'
          }
        }]
      };

      chart.setOption(option);
      return chart;
    });
  },

  // 初始化第五个图表：最火的岗位
  initChart5() {
    const ecComponent = this.selectComponent('#mychart-dom-popular-jobs');
    ecComponent.init((canvas, width, height, dpr) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: Math.max(height, this.data.popularJobs.length * 20),
        devicePixelRatio: dpr
      });

      const option = {
        title: {
          text: '最火的岗位'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: this.data.popularJobs.map(item => item.title),
          axisLabel: {
            interval: 0,
            rotate: 45,
            formatter: function (value) {
              return value.length > 5 ? value.slice(0, 5) + '...' : value;
            }
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: '数量',
          type: 'bar',
          data: this.data.popularJobs.map(item => item.count),
          itemStyle: {
            color: '#87cefa'
          }
        }]
      };

      chart.setOption(option);
      return chart;
    });
  }
});