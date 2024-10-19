const db = wx.cloud.database();
const jobDetail = db.collection('jobDetail');
const _ = db.command;
const util = require('../utils/utils');

Page({
  data: {
    new: [],         // 搜索结果
    searchHistory: [] // 历史搜索记录
  },

  onLoad: function (options) {
    // 页面加载时获取本地存储的历史记录
    const history = wx.getStorageSync('searchHistory') || [];
    this.setData({
      searchHistory: history
    });
  },

  onChange(e) {
    if (!e.detail) {
      this.setData({
        new: []
      });
      return;
    }
    util.debounce(() => {
      let key = new db.RegExp({
        regexp: e.detail,
        options: "i"
      });
      jobDetail.where({
          title: key
        },
        _.or([{
          context: key
        }])
      ).get().then((res) => {
        for (let i = 0; i < res.data.length; i++) {
          const element = res.data[i];
          res.data[i].date = util.formatDate(element.date);
        }
        this.setData({
          new: res.data
        });
      });
    }, 250);
  },

  onSearch(e) {
    const searchTerm = e.detail;
    if (!searchTerm) return;

    // 获取当前的历史记录
    let history = wx.getStorageSync('searchHistory') || [];

    // 如果当前搜索词不在历史记录中，才添加
    if (history.indexOf(searchTerm) === -1) {
      history.unshift(searchTerm); // 新搜索的放在最前面
      if (history.length > 10) {
        history.pop(); // 只保留10条搜索记录
      }
      wx.setStorageSync('searchHistory', history);
    }

    // 设置历史记录到 data 中
    this.setData({
      searchHistory: history
    });

    // 进行搜索
    let key = new db.RegExp({
      regexp: searchTerm,
      options: "i"
    });
    jobDetail.where({
        title: key
      },
      _.or([{
        context: key
      }])
    ).get().then((res) => {
      for (let i = 0; i < res.data.length; i++) {
        const element = res.data[i];
        res.data[i].date = util.formatDate(element.date);
      }
      this.setData({
        new: res.data
      });
    });
  },

  // 点击历史记录进行搜索
  searchFromHistory(e) {
    const searchTerm = e.currentTarget.dataset.term;
    this.setData({
      value: searchTerm // 设置搜索框的值
    });
    this.onSearch({ detail: searchTerm }); // 进行搜索
  },

  // 清空历史记录
  clearHistory() {
    wx.removeStorageSync('searchHistory');
    this.setData({
      searchHistory: []
    });
  },

  detail(e) {
    let id = e.target.dataset.id;
    let type = e.target.dataset.type;
    wx.navigateTo({
      url: '../detail/detail?id=' + id + '&type=' + type
    });
  }
});