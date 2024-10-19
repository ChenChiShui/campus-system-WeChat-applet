const db = wx.cloud.database();
const jobDetail = db.collection('jobDetail');
const util = require('../utils/utils');

Page({
  data: {
    swiper: [
      { img: "../../images/swiper/swiper1.jpg" },
      { img: "../../images/swiper/swiper3.jpg" }
    ],
    list: [
      { img: "/images/icon/write.png", text: "搜索兼职", tag: "write" },
      { img: "/images/icon/teach.png", text: "兼职地图", tag: 'teach' },
      { img: "/images/icon/fastMail.png", text: "修改用户信息", tag: "fastMail" },
      { img: "/images/icon/waiter.png", text: "发布招聘", tag: "waiter" },
      { img: "/images/icon/user.png", text: "用户", tag: "takeOut" },
      { img: "/images/icon/invite.png", text: "统计", tag: "cnt" }
    ],
    fire: [],
    new: [],
    activeNames: ['1'],
    notice: "公告：北一2083大甩卖",  // 默认公告
    fireTime: '',
    jobCount: 0,   // 招聘信息总数
    userCount: 0,  // 用户总数
    noticeList: [  // 模拟的公告列表
      "公告：北一2083大甩卖",
      "公告：本周五晚7点招聘会，欢迎参加",
      "公告：招聘兼职家教，详情请联系HR",
      "公告：新用户注册可享受特别优惠",
      "公告：国庆特惠活动即将开始，敬请期待"
    ],
    noticeIndex: 0,    // 当前显示的公告索引
    noticeAnimation: {} // 用于存储动画对象
  },

  onLoad() {
    this.getjobDetail();  // 获取招聘信息
    this.startNoticeRotation();  // 开始公告轮播
  },
  // 处理图片点击事件
  onImageClick(e) {
    const index = e.currentTarget.dataset.index;
    console.log("点击了第", index + 1, "个图片");
    // 可以在这里添加其他点击逻辑
  },
  onUnload() {
    if (this.noticeInterval) {
      clearInterval(this.noticeInterval); // 清除定时器
    }
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
      this.setData({
        new: re
      });
    });
  },

  // 开始公告轮播
  startNoticeRotation() {
    this.noticeInterval = setInterval(() => {
      this.playNoticeAnimation();  // 播放动画

      let nextIndex = (this.data.noticeIndex + 1) % this.data.noticeList.length;

      // 在动画结束时更新公告内容
      setTimeout(() => {
        this.setData({
          notice: this.data.noticeList[nextIndex],
          noticeIndex: nextIndex
        });
        this.playNoticeAnimation(true);  // 淡入新的公告
      }, 400);  // 动画时长 400ms
    }, 3000);  // 每 3 秒切换一次公告
  },

  // 播放淡入淡出动画
  playNoticeAnimation(isFadeIn = false) {
    let animation = wx.createAnimation({
      duration: 400,    // 动画持续时间 400ms
      timingFunction: 'ease-in-out'
    });

    if (isFadeIn) {
      animation.opacity(1).step();  // 淡入
    } else {
      animation.opacity(0).step();  // 淡出
    }

    this.setData({
      noticeAnimation: animation.export()  // 导出动画数据
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
        url: '../fixUser/fixUser',  // 跳转到修改用户信息页面
      });
    }
    else if (name == 'takeOut') {
      wx.navigateTo({
        url: '../user/user',  // 跳转到用户页面
      });
    } 
    else if (name == 'waiter') {
      wx.navigateTo({
        url: '../my/detail/pub/pub',  // 跳转到发布招聘页面
      });
    }
    else if (name == 'teach') {
      wx.navigateTo({
        url: '../map/map'
      });
    }
    else if (name == 'write') {
      wx.navigateTo({
        url: '../search/search'
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