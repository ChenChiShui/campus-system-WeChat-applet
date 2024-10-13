const db = wx.cloud.database();
const jobDetail = db.collection('jobDetail');

Page({
  data: {
    show: false,
    title: '',
    phone: '',
    address: '',
    email: '',
    salary: '',
    tag: '',
    context: '',
    columns: ['写作', '服务生', '快递分拣', '送餐员', '家教', '其他'],
    images: [], // 用于存储图片的临时路径
  },

  onLoad: function (options) {},

  onTitle(e) {
    this.setData({
      title: e.detail
    });
  },

  onPhone(e) {
    this.setData({
      phone: e.detail
    });
  },

  onAddress(e) {
    this.setData({
      address: e.detail
    });
  },

  onTag(e) {
    this.setData({
      tag: e.detail
    });
  },

  onEmail(e) {
    this.setData({
      email: e.detail
    });
  },

  onSalary(e) {
    this.setData({
      salary: e.detail
    });
  },

  onContext(e) {
    this.setData({
      context: e.detail.value
    });
  },

  isShow() {
    this.setData({
      show: true
    });
  },

  // 选择图片
  chooseImage() {
    wx.chooseImage({
      count: 4, // 最多可以选择4张图片
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          images: this.data.images.concat(res.tempFilePaths)
        });
      }
    });
  },

  // 上传图片
  uploadImages() {
    const uploadPromises = this.data.images.map((imagePath) => {
      return wx.cloud.uploadFile({
        cloudPath: `jobImages/${new Date().getTime()}-${Math.floor(Math.random(0, 1) * 1000)}.png`,
        filePath: imagePath
      });
    });

    return Promise.all(uploadPromises);
  },

  // 发布功能
  pub() {
    let date = new Date().getTime();
    let tag = this.data.tag;
    let t = '';
    let { address, title, phone, email, salary, context } = this.data;

    if (!this.checkPhone(phone)) {
      wx.showToast({
        title: '手机号输入不正确',
        icon: 'none'
      });
      return;
    }
    if (!this.checkEmail(email)) {
      wx.showToast({
        title: '邮箱输入不正确',
        icon: 'none'
      });
      return;
    }

    switch (tag) {
      case '写作':
        t = 'write';
        break;
      case '家教':
        t = 'teach';
        break;
      case '快递分拣':
        t = 'fastMail';
        break;
      case '服务生':
        t = 'waiter';
        break;
      case '送餐员':
        t = 'takeOut';
        break;
      default:
        t = this.data.tag;
        break;
    }

    // 上传图片并发布数据
    this.uploadImages().then((uploadResults) => {
      const imageUrls = uploadResults.map(res => res.fileID);

      jobDetail.add({
        data: {
          address,
          title,
          phone,
          email,
          salary,
          context,
          date,
          tagName: tag,
          tag: t,
          images: imageUrls // 保存图片的 fileID
        }
      }).then((res) => {
        wx.showToast({
          title: '发布成功',
          icon: 'success'
        });
        wx.navigateBack({
          delta: 1,
        });
      });
    }).catch((err) => {
      wx.showToast({
        title: '图片上传失败',
        icon: 'none'
      });
    });
  },

  // 选择标签
  onConfirm(event) {
    const { value } = event.detail;
    this.setData({
      tag: value,
      show: false
    });
  },

  // 取消选择
  onCancel() {
    this.setData({
      show: false
    });
  },

  // 显示弹出层
  showPopup() {
    this.setData({
      show: true
    });
  },

  // 关闭弹出层
  onClose() {
    this.setData({
      show: false
    });
  },

  // 验证手机号
  checkPhone(phone) {
    let reg = /1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}/g;
    return reg.test(phone);
  },

  // 验证邮箱
  checkEmail(email) {
    let reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/g;
    return reg.test(email);
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    let images = this.data.images;
    images.splice(index, 1);
    this.setData({ images });
  }
});