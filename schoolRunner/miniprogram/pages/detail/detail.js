const db = wx.cloud.database();
const _ = db.command;
const jobDetail = db.collection('jobDetail');
const jobList = db.collection('jobList');
const util = require("../utils/utils");
let app = getApp();

Page({
  data: {
    info: {},       // 职位详情
    time: '',       // 时间
    show: false,    // 弹窗显示控制
    title: [],      // 简历的标题列表
    id: '',         // 职位ID
    images: []      // 用于存储图片的URL
  },

  onLoad: function (options) {
    let id = options.id;
    this.setData({
      id
    });
    this.getjobDetail(id);
  },

  // 获取职位详情
  getjobDetail(id) {
    jobDetail.where({
      _id: id
    }).get().then((res) => {
      let info = res.data[0];
      let time = util.formatDate(info.date);
      let images = info.images || []; // 获取图片数组（假设是fileID数组）

      console.log("Images fileID array:", images);  // 打印fileID数组

      // 如果图片是 fileID，需要获取临时 URL
      if (images.length > 0) {
        wx.cloud.getTempFileURL({
          fileList: images, // fileID 数组
          success: res => {
            const tempUrls = res.fileList.map(file => file.tempFileURL);
            console.log("Temporary URLs:", tempUrls); // 打印可访问的URL
            this.setData({
              info,
              time,
              images: tempUrls // 设置为可访问的图片 URL
            });
          },
          fail: err => {
            console.error("Error getting temp file URL", err);
          }
        });
      } else {
        this.setData({
          info,
          time,
          images: [] // 如果没有图片，设置为空数组
        });
      }
    }).catch(err => {
      console.error(err);
    });
  },

  // 用户报名
  join() {
    wx.vibrateLong({
      success: () => {
        console.log('手机长时间震动成功');
      },
      fail: (err) => {
        console.error('手机震动失败', err);
      }
    });
    jobList.get().then((res) => {
      if (res.data.length === 0) {
        wx.showToast({
          title: '请先上传简历',
          icon: 'none'
        });
      } else {
        let title = res.data.map(item => item.title);
        this.setData({
          show: true,
          columns: res.data,
          title
        });
      }
    });
  },

  // 拨打电话
  makePhoneCall() {
    wx.vibrateLong({
      success: () => {
        console.log('手机长时间震动成功');
      },
      fail: (err) => {
        console.error('手机震动失败', err);
      }
    });
    const phone = this.data.info.phone;
    if (phone) {
      wx.makePhoneCall({
        phoneNumber: phone,
        success: () => {
          console.log('成功拨打电话');
        },
        fail: () => {
          console.log('拨打电话失败');
        }
      });
    } else {
      wx.showToast({
        title: '没有提供联系电话',
        icon: 'none'
      });
    }
  },

  // 点击确认选择简历
  onConfirm(e) {

    let { openid } = app.globalData;
    let { index, value } = e.detail;
    let date = new Date().getTime();
    let url = this.data.columns[index].url;
    let obj = {
      date,
      value,
      url,
      openid
    };

    // 检查用户是否已经报名该职位
    jobDetail.where({
      _id: this.data.id,
      jobDocList: _.all([
        _.elemMatch({
          openid
        })
      ])
    }).count().then((res) => {
      if (res.total === 0) {
        // 用户尚未报名
        jobDetail.doc(this.data.id).update({
          data: {
            jobDocList: _.push(obj)
          }
        }).then(() => {
          this.setData({
            show: false
          });
          wx.showToast({
            title: '报名成功'
          });
        });
      } else {
        // 用户已报名
        this.setData({
          show: false
        });
        wx.showToast({
          title: '您已报名此职位，无需重复报名',
          icon: 'none'
        });
      }
    }).catch(err => {
      wx.showToast({
        title: '出错啦',
        icon: 'none'
      });
      console.error(err);
    });
  },

  // 取消选择简历
  onCancel() {
    this.setData({
      show: false
    });
  },

  // 页面下拉刷新
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading(); // 在标题栏中显示加载
    let id = this.data.id;
    this.getjobDetail(id);
    // 模拟加载动作
    setTimeout(function () {
      wx.hideNavigationBarLoading();  // 完成停止加载
      wx.stopPullDownRefresh();       // 停止下拉刷新
    }, 1500);
  },

  // 图片点击事件，预览图片
  handleImagePreview(e) {
    const currentUrl = e.currentTarget.dataset.url; // 当前点击图片的URL
wx.vibrateShort({
success: () => {
console.log('手机震动成功');
},
fail: (err) => {
console.error('手机震动失败', err);
}
});

    
    wx.previewImage({
      current: currentUrl,    // 当前显示图片的http链接
      urls: this.data.images  // 需要预览的图片http链接列表
    });
  },

  // 图片加载成功
  onImageLoad(e) {
    console.log('Image loaded successfully:', e);
  },

  // 图片加载失败
  onImageError(e) {
    console.error('Image load error:', e.detail.errMsg);
  }
});