Page({
  data: {
    id: '', // 用户的数据库 _id
    avatarUrl: '', // 用户头像 URL
    nickName: '', // 用户昵称
    gender: 0, // 性别（0：未知，1：男，2：女）
    genderLabel: '未知', // 性别的显示标签
    city: '', // 用户所在城市
    country: '', // 用户所在国家
    province: '', // 用户所在省份
    showGenderPopup: false, // 控制性别选择弹出框显示
    genderColumns: ['未知', '男', '女'], // 性别选项

    // 城市、国家、和省份相关的数据
    showCityPopup: false,
    cityColumns: ['北京', '上海', '广州', '深圳', '其他'], // 示例城市列表

    showProvincePopup: false,
    provinceColumns: ['北京市', '上海市', '广东省', '浙江省', '其他'], // 示例省份列表

    showCountryPopup: false,
    countryColumns: ['中国', '美国', '英国', '加拿大', '其他'] // 示例国家列表
  },

  // 页面加载时获取用户信息
  onLoad: function () {
    this.getOpenIdAndLoadUserInfo(); // 通过云函数获取 openId 并加载用户信息
  },

  // 调用云函数获取 openId 并加载用户信息
  getOpenIdAndLoadUserInfo() {
    wx.cloud.callFunction({
      name: 'login', // 云函数的名字，假设为 'login'
      success: res => {
        const openId = res.result.openid; // 获取云函数返回的 openId
        console.log('用户的 openId:', openId);

        // 使用 openId 加载用户信息
        this.loadUserInfo(openId);
      },
      fail: err => {
        wx.showToast({
          title: '获取 openId 失败',
          icon: 'none'
        });
        console.error('调用云函数失败:', err);
      }
    });
  },

  // 从 info 集合加载用户信息
  loadUserInfo(openId) {
    const db = wx.cloud.database();

    // 通过 openId 查询用户信息
    db.collection('info').where({
      _openid: openId // 使用 openId 查询
    }).get().then(res => {
      // 检查是否找到了用户数据
      if (res.data.length > 0) {
        const userInfo = res.data[0];
        console.log('用户信息加载成功:', userInfo); // 输出用户信息，方便调试

        this.setData({
          id: userInfo._id, // 这里是数据库中的 _id
          avatarUrl: userInfo.avatarUrl,
          nickName: userInfo.nickName,
          gender: userInfo.gender,
          genderLabel: this.getGenderLabel(userInfo.gender),
          city: userInfo.city,
          country: userInfo.country,
          province: userInfo.province
        });
      } else {
        // 如果没有找到对应的用户信息
        wx.showToast({
          title: '用户信息未找到',
          icon: 'none'
        });
        console.warn('没有找到与该 openId 对应的用户信息:', openId); // 输出调试信息
      }
    }).catch(err => {
      // 输出错误日志
      wx.showToast({
        title: '加载用户信息失败',
        icon: 'none'
      });
      console.error('加载用户信息失败:', err);
    });
  },
// 更新昵称
onNickNameInput(e) {
  this.setData({
  nickName: e.detail
  });
  },
  // 根据 gender 值返回性别标签
  getGenderLabel(gender) {
    if (gender === 1) return '男';
    if (gender === 2) return '女';
    return '未知';
  },
 // 更换头像
 changeAvatar() {
  wx.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const filePath = res.tempFilePaths[0];
      // 上传到云存储
      wx.cloud.uploadFile({
        cloudPath: `avatars/${new Date().getTime()}-${Math.floor(Math.random() * 1000)}.png`,
        filePath: filePath
      }).then((uploadRes) => {
        const avatarUrl = uploadRes.fileID;
        this.setData({
          avatarUrl: avatarUrl
        });
        // 保存到数据库
        this.saveAvatar(avatarUrl);
      }).catch(err => {
        wx.showToast({
          title: '头像上传失败',
          icon: 'none'
        });
      });
    }
  });
},
  // 性别选择事件
  onGenderSelect() {
    this.setData({
      showGenderPopup: true
    });
  },
  onGenderConfirm(event) {
    const { value } = event.detail;
    const gender = this.data.genderColumns.indexOf(value);
    this.setData({
      gender: gender,
      genderLabel: value,
      showGenderPopup: false
    });
  },

  // 城市选择事件
  onCitySelect() {
    this.setData({
      showCityPopup: true
    });
  },
  onCityConfirm(event) {
    const { value } = event.detail;
    this.setData({
      city: value,
      showCityPopup: false
    });
  },

  // 省份选择事件
  onProvinceSelect() {
    this.setData({
      showProvincePopup: true
    });
  },
  onProvinceConfirm(event) {
    const { value } = event.detail;
    this.setData({
      province: value,
      showProvincePopup: false
    });
  },

  // 国家选择事件
  onCountrySelect() {
    this.setData({
      showCountryPopup: true
    });
  },
  onCountryConfirm(event) {
    const { value } = event.detail;
    this.setData({
      country: value,
      showCountryPopup: false
    });
  },

  // 保存修改后的信息
  onSave() {
    const db = wx.cloud.database();
    const { id, avatarUrl, nickName, gender, city, country, province } = this.data;

    // 检查是否填写了必要信息
    if (!nickName) {
      wx.showToast({
        title: '昵称不能为空',
        icon: 'none'
      });
      return;
    }

    // 更新用户信息到数据库
    db.collection('info').doc(id).update({
      data: {
        avatarUrl,
        nickName,
        gender,
        city,
        country,
        province,
        updateTime: new Date() // 记录更新时间
      }
    }).then(() => {
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
    }).catch(err => {
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      });
      console.error('更新用户信息失败:', err); // 输出详细错误信息
    });
  }
});