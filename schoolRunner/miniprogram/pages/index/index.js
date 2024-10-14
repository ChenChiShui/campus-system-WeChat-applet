const db = wx.cloud.database();
const jobDetail = db.collection('jobDetail');
const info = db.collection('info');
const util = require('../utils/utils');

Page({
  data: {
    swiper: [
      { img: "../../images/swiper/swiper1.jpg" },
      { img: "../../images/swiper/swiper3.jpg" }
    ],
    list: [
      { img: "/images/icon/write.png", text: "写作", tag: "write" },
      { img: "/images/icon/teach.png", text: "家教", tag: 'teach' },
      { img: "/images/icon/fastMail.png", text: "修改用户信息", tag: "fastMail" },
      { img: "/images/icon/waiter.png", text: "发布招聘", tag: "waiter" },
      { img: "/images/icon/icon-user_info.png", text: "用户", tag: "takeOut" },
      { img: "/images/icon/invite.png", text: "统计", tag: "cnt" }
    ],
    fire: [],
    new: [],
    activeNames: ['1'],
    notice: "公告：北一2083大甩卖",
    fireTime: '',
    jobCount: 0,   // 招聘信息总数
    userCount: 0   // 用户总数
  },

  onLoad() {
    this.getjobDetail();
  },

  // 获取招聘信息列表
  getjobDetail() {
    jobDetail.orderBy('date', 'desc').limit(7).get().then((res) => {
      let re = res.data;
      for (let i = 0; i < res.data.length; i++) {
        const element = res.data[i];
        res.data[i].date = util.formatDate(element.date);
        res.data[i].salary = element.salary || '面议';  // 如果没有薪资，显示“面议”
        
        // 如果数据库没有图片字段，给每个职位一个默认图片
        res.data[i].image = element.image || '/images/default.png';  // 替换为实际路径
      }
      console.log(re);  // 打印数据，确保 image 字段存在
      this.setData({
        new: re
      });
    });
  },

  // 用于展开/收起折叠面板
  onChange(event) {
    this.setData({
      activeNames: event.detail
    });
  },

  // 跳转到职位详情页
  detail(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../detail/detail?id=' + id,
    });
  },

  // 处理分类点击事件
  tagDetail(e) {
    let name = e.currentTarget.dataset.name;

    if (name === 'cnt') {
      wx.navigateTo({
        url: '../statistics/statistics',  // 跳转到统计页面
      });
    }
    else if (name == 'fastMail') {
      wx.navigateTo({
        url: '../fixUser/fixUser',  // 跳转到统计页面
      });
    }
    else if (name == 'takeOut') {
      wx.navigateTo({
        url: '../user/user',  // 跳转到统计页面
      });
    } 
    else if (name == 'waiter')
    {
      wx.navigateTo({
        url: '../my/detail/pub/pub',
      });
    }
    else {
      wx.navigateTo({
        url: '../tagList/tagList?name=' + name,
      });
    }
  },

  // 跳转到搜索页面
  search() {
    wx.navigateTo({
      url: '../search/search',
    });
  },

  // 下拉刷新功能
  onPullDownRefresh() {
    wx.showNavigationBarLoading(); // 在标题栏中显示加载
    this.getjobDetail(); // 重新拉取招聘信息
    setTimeout(function () {
      wx.hideNavigationBarLoading(); // 完成停止加载
      wx.stopPullDownRefresh(); // 停止下拉刷新
    }, 1500);
  }
});