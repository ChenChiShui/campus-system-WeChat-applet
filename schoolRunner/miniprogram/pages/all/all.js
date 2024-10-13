const db = wx.cloud.database();
const jobDetail = db.collection('jobDetail');
const util = require('../utils/utils'); // 引用工具函数

Page({
  data: {
    new: [],        // 初始兼职数据为空
    sortedJobs: [], // 排序后的兼职信息
    sortMethod: 'tag', // 初始排序方式，可以是 'tag' 或 'date'
    sortOrder: 'asc',  // 排序顺序，默认升序 'asc'，'desc' 为降序
    loading: true,  // 加载状态
    page: 0         // 当前分页的索引
  },

  onLoad() {
    this.getNew(); // 页面加载时获取数据
  },

  // 切换排序方式和顺序
  switchSortMethod(e) {
    const { method } = e.currentTarget.dataset;
    const { sortMethod, sortOrder } = this.data;

    // 如果点击的排序方法和当前方法相同，则切换升降序
    const newSortOrder = sortMethod === method ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc';

    this.setData({
      sortMethod: method,
      sortOrder: newSortOrder
    }, () => {
      this.sortJobs(); // 切换排序方式后重新排序
    });
  },

  // 对兼职列表进行排序
  sortJobs() {
    const { new: jobList, sortMethod, sortOrder } = this.data;

    let sortedJobs = [];
    
    // 根据排序方法进行不同的排序逻辑
    if (sortMethod === 'tag') {
      // 按标签排序
      wx.vibrateLong({
        success: () => {
          console.log('手机长时间震动成功');
        },
        fail: (err) => {
          console.error('手机震动失败', err);
        }
      });
      sortedJobs = jobList.sort((a, b) => {
        const comparison = a.tagName.localeCompare(b.tagName);
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    } else if (sortMethod === 'date') {
      // 按时间排序
      wx.vibrateLong({
        success: () => {
          console.log('手机长时间震动成功');
        },
        fail: (err) => {
          console.error('手机震动失败', err);
        }
      });
      sortedJobs = jobList.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }

    this.setData({
      sortedJobs
    });
  },

  getNew() {
    this.setData({
      loading: true
    });

    // 按照日期降序获取前10条数据
    jobDetail.orderBy('date', 'desc').limit(100).get().then((res) => {
      if (res.data && res.data.length > 0) {
        const newData = res.data.map((element) => {
          return {
            ...element,
            // 设置图片处理逻辑
            image: (Array.isArray(element.images) && element.images.length > 0)
              ? element.images[0]
              : '/images/default.png',
            date: element.date ? util.formatDate(element.date) : "未知日期",
            salary: element.salary || "面议",
            // 根据 tagName 设置标签颜色
            tagColor: this.getTagColor(element.tagName)
          };
        });

        this.setData({
          new: newData, // 直接覆盖当前数据
          page: 100,     // 设置分页数为10
          loading: false
        });

        // 进行排序
        this.sortJobs();
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

  // 根据 tagName 设置不同的颜色（仅用于标签）
  getTagColor(tagName) {
    switch(tagName) {
      case "其他":
        return "#FF9800";  // 橙色
      case "家教":
        return "#4CAF50";  // 绿色
      case "写作":
        return "#9C27B0";  // 紫色
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
    const { page, new: currentData } = this.data;
    const nextPage = page + 10;

    // 设置加载状态
    this.setData({
      loading: true
    });

    // 从数据库中跳过当前页数，获取新的数据
    jobDetail.skip(nextPage).limit(10).get().then((res) => {
      if (res.data && res.data.length > 0) {
        let newData = res.data.map((element) => {
          return {
            ...element,
            image: (Array.isArray(element.images) && element.images.length > 0)
              ? element.images[0]
              : '/images/default.png',
            date: element.date ? util.formatDate(element.date) : '未知日期',
            salary: element.salary || '面议',
            tagColor: this.getTagColor(element.tagName) // 设置标签颜色
          };
        });

        // 合并新数据并取消加载状态
        this.setData({
          new: currentData.concat(newData), // 将新数据与当前数据合并
          page: nextPage, // 更新分页
          loading: false 
        });

        // 进行排序
        this.sortJobs();
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
    let { id, type } = e.currentTarget.dataset;

    console.log('点击的兼职ID:', id, '类型:', type);

    wx.navigateTo({
      url: '../detail/detail?id=' + id + '&type=' + type
    });
  },

  // 下拉刷新时重新加载数据
  onPullDownRefresh() {
    wx.showNavigationBarLoading(); // 在标题栏中显示加载动画
    this.getNew(); // 重新获取数据

    setTimeout(() => {
      wx.hideNavigationBarLoading(); // 停止标题栏加载动画
      wx.stopPullDownRefresh(); // 停止下拉刷新
    }, 1500);
  }
});