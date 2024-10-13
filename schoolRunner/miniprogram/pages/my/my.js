const app = getApp();
const db = wx.cloud.database();
const info = db.collection('info');  // 连接数据库中的 "info" 集合

Page({
  data: {
    userInfo: {
      nickName: '昵称',
      avatarUrl: '/images/head.jpg'
    },
    show: true,  // 控制是否显示 "获取用户信息" 按钮
    openid: '',
    piece: [
      { name: "我的投递", url: "./detail/deliver/deliver" },
      { name: "简历上传", url: "./detail/uploadDoc/uploadDoc" },
      { name: "发布招聘", url: "./detail/pub/pub" },
      { name: "我的招聘", url: "./detail/myPub/myPub" },
      { name: "联系我们", url: "./detail/contact/contact" }
    ]
  },

  async onLoad() {
    // 获取 openid
    if (!app.globalData.openid) {
      await wx.cloud.callFunction({
        name: 'login',
        success: res => {
          app.globalData.openid = res.result.openid;
          this.setData({
            openid: res.result.openid
          });
        }
      });
    } else {
      this.setData({
        openid: app.globalData.openid
      });
    }

    // 查询数据库中的用户信息
    this.getUserInfoFromDatabase();
  },

  // 从数据库中获取用户信息
  getUserInfoFromDatabase() {
    let openid = this.data.openid;
    info.where({
      _openid: openid
    }).get().then((res) => {
      if (res.data.length === 0) {
        // 没有用户记录，显示获取用户信息按钮
        this.setData({
          show: true
        });
      } else {
        // 有用户记录，显示用户信息
        this.setData({
          userInfo: res.data[0],
          show: false  // 隐藏获取用户信息的按钮
        });
      }
    });
  },

  // 获取用户信息，并存储到数据库
  getUserInfomation() {
    wx.getUserProfile({
      desc: '用于完善会员资料',  // 提示用户授权的用途
      success: (res) => {
        const userInfo = res.userInfo;
        const { avatarUrl, nickName, city, country, gender, language, province } = userInfo;

        // 查看数据库中是否已经有该用户
        info.where({
          _openid: this.data.openid
        }).get().then((queryRes) => {
          if (queryRes.data.length === 0) {
            // 如果数据库中没有该用户，插入新记录
            info.add({
              data: {
                avatarUrl,
                nickName,
                city,
                country,
                gender,
                language,
                province,
                createTime: db.serverDate()  // 插入记录的时间
              }
            }).then(() => {
              console.log('用户信息已存储到数据库');
            }).catch(err => {
              console.error('存储用户信息失败', err);
            });
          } else {
            // 如果用户已经存在，更新用户信息
            const userId = queryRes.data[0]._id;
            info.doc(userId).update({
              data: {
                avatarUrl,
                nickName,
                city,
                country,
                gender,
                language,
                province,
                updateTime: db.serverDate()  // 更新记录的时间
              }
            }).then(() => {
              console.log('用户信息已更新');
            }).catch(err => {
              console.error('更新用户信息失败', err);
            });
          }

          // 更新页面显示的用户信息
          this.setData({
            userInfo: userInfo,
            show: false  // 隐藏获取用户信息按钮
          });
        });
      },
      fail: (err) => {
        console.error('用户拒绝授权:', err);
      }
    });
  }
});