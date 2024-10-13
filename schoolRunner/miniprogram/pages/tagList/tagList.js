const db = wx.cloud.database();
const jobDetail = db.collection('jobDetail');
const util = require('../utils/utils'); // 引用工具函数

Page({
  data: {
    info: [], // 存储从数据库获取的兼职信息
    name: ''  // 当前选择的分类标签
  },

  // 页面加载时触发
  onLoad: function (options) {
    // 从页面的参数中获取 `name`
    let name = options.name;
    this.setData({
      name
    });
    // 根据 `name` 获取兼职详情
    this.getjobDetail(name);
  },

  // 获取兼职详情的方法
  getjobDetail(name) {
    jobDetail.where({
      tag: name  // 根据 `tag` 字段筛选数据
    }).get().then((res) => {
      // 对获取的数据进行处理
      for (let i = 0; i < res.data.length; i++) {
        const element = res.data[i];
        // 格式化日期
        res.data[i].date = util.formatDate(element.date);
      }
      // 将处理后的数据更新到 `info` 中
      this.setData({
        info: res.data
      });
    }).catch((err) => {
      console.error("获取数据失败: ", err);
    });
  },

  // 点击兼职详情时跳转到详情页面
  detail(e) {
    let { id, type } = e.currentTarget.dataset;
    wx.navigateTo({
      url: '../detail/detail?id=' + id + '&type=' + type
    });
  },

  // 下拉刷新时触发
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading(); // 在标题栏中显示加载
    this.getjobDetail(this.data.name); // 重新获取数据
    // 模拟加载
    setTimeout(function () {
      // 完成停止加载
      wx.hideNavigationBarLoading(); // 隐藏加载状态
      wx.stopPullDownRefresh();      // 停止下拉刷新
    }, 1500);
  }
});