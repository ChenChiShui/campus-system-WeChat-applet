const db = wx.cloud.database();
const jobDetail = db.collection('jobDetail');
const util = require('../utils/utils'); // 引用工具函数

Page({
  data: {
    new: [],       // 初始兼职数据为空
    loading: true, // 加载状态
    page: 0        // 当前分页的索引
  },

  onLoad() {
    // 页面加载时获取最新兼职信息
    this.getNew();
  },

  getNew() {
    this.setData({
      loading: true
    });
  
    jobDetail.orderBy('date', 'desc').limit(10).get().then((res) => {
      if (res.data && res.data.length > 0) {
        for (let i = 0; i < res.data.length; i++) {
          const element = res.data[i];
  
          // 设置图片处理逻辑
          res.data[i].image = (Array.isArray(element.images) && element.images.length > 0)
            ? element.images[0]
            : '/images/default.png';
  
          // 设置标签的背景颜色，根据 tagName 动态赋值
          res.data[i].tagColor = this.getTagColor(element.tagName);
  
          // 日期和薪资处理逻辑
          res.data[i].date = element.date ? util.formatDate(element.date) : "未知日期";
          res.data[i].salary = element.salary || "面议";
        }
  
        this.setData({
          new: res.data,
          page: 0,
          loading: false
        });
      } else {
        this.setData({
          new: [],
          loading: false
        });
      }
    }).catch((err) => {
      console.error("获取数据失败", err);
      this.setData({
        loading: false
      });
    });
  },
  
  // 根据 tagName 设置不同的颜色
  getTagColor(tagName) {
    switch(tagName) {
      case "其他":
        return "#FF9800";  // 橙色
      case "写作":
        return "#4CAF50";  // 绿色
      case "送餐员":
        return "#2196F3";  // 蓝色
      case "快递分拣":
        return "#F44336";  // 红色
      default:
        return "#9E9E9E";  // 灰色（默认颜色）
    }
  },
  // 捕捉图片加载错误并输出到控制台
  handleImageError(e) {
    console.log('图片加载失败，错误信息:', e.detail.errMsg);
  },
  // 上拉触底时加载更多兼职信息
  onReachBottom() {
    let page = this.data.page + 10;

    // 设置加载状态
    this.setData({
      loading: true
    });

    jobDetail.skip(page).limit(10).get().then((res) => {
      if (res.data && res.data.length > 0) {
        let newData = res.data;

        for (let i = 0; i < newData.length; i++) {
          const element = newData[i];

          // 检查 element 和 element.date 是否存在
          newData[i].date = element && element.date ? util.formatDate(element.date) : '未知日期';
          
          // 如果没有薪资信息，显示“面议”
          newData[i].salary = element.salary || '面议';

          // 如果没有图片信息，显示默认图片
          newData[i].image = element.image || '/images/default.png';
        }

        let oldData = this.data.new;
        // 合并新数据并取消加载状态
        this.setData({
          new: oldData.concat(newData),
          page: page,
          loading: false
        });
      } else {
        // 没有更多数据时，不再加载
        this.setData({
          loading: false
        });
        console.log("没有更多数据了");
      }
    }).catch((err) => {
      console.error("加载更多数据失败", err);
      // 发生错误时，取消加载状态
      this.setData({
        loading: false
      });
    });
  },

// 点击某一兼职项时，跳转到详情页面
detail(e) {
  // 获取当前点击元素的 dataset 中的 id 和 type
  let { id, type } = e.currentTarget.dataset;

  // 输出调试信息
  console.log('点击的兼职ID:', id, '类型:', type);

  // 跳转到详情页面，并传递 id 和 type 参数
  wx.navigateTo({
    url: '../detail/detail?id=' + id + '&type=' + type
  });
},
  // 下拉刷新时重新加载数据
  onPullDownRefresh() {
    wx.showNavigationBarLoading(); // 在标题栏中显示加载动画
    this.getNew(); // 重新获取数据

    // 模拟加载完成
    setTimeout(() => {
      wx.hideNavigationBarLoading(); // 停止标题栏加载动画
      wx.stopPullDownRefresh(); // 停止下拉刷新
    }, 1500);
  }
});