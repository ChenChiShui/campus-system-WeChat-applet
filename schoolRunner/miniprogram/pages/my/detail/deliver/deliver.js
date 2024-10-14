const util = require('../../../utils/utils');
const db = wx.cloud.database();
const jobDetail = db.collection('jobDetail');
const _ = db.command;
const app = getApp();

Page({
  data: {
    list: []
  },

  onLoad: function (options) {
    this.getJobDetail();
  },

  // 获取招聘详情
  getJobDetail() {
    let { openid } = app.globalData;
    jobDetail.orderBy('date', 'desc').where({
      jobDocList: _.elemMatch({
        openid
      })
    }).get().then((res) => {
      console.log('获取到的 jobDetail 数据:', res.data);  // 打印获取到的招聘数据
  
      let jobList = res.data.map((element) => {
        // 格式化日期
        let date = element.jobDocList[0].date;
        element.jobDocList[0].date = util.formatDate(date);
        
        // 确保 description 不为 null 或 undefined，设置为空字符串 ""
        element.jobDocList[0].description = element.jobDocList[0].description || "";
    
        // 随机生成简历是否已被查看的信息
        element.jobDocList[0].isViewed = Math.random() > 0.5;  // 随机布尔值：50% 概率为 true 或 false
    
        return element;
      });
      
      // 更新页面数据
      this.setData({
        list: jobList
      });
  
      console.log('处理后的 jobList 数据:', this.data.list);  // 打印处理后的列表数据
    }).catch((err) => {
      console.error('获取 jobDetail 数据失败:', err);
    });
  },
  goToJobPage(event) {
    const jobId = event.currentTarget.dataset.id;
    console.log('跳转的 jobId:', jobId);  // 打印 jobId，确保正确传递
  
    // 确保路径正确，根据实际路径修改
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + jobId
    });
  },

  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();  // 在标题栏中显示加载
    this.getJobDetail();            // 刷新数据
    setTimeout(() => {
      wx.hideNavigationBarLoading(); // 完成停止加载
      wx.stopPullDownRefresh();      // 停止下拉刷新
    }, 1500);
  }
});