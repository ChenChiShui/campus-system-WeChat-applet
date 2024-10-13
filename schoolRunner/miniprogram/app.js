//app.js

App({
  onLaunch: function () {

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'env1-0gb60mpl4f29bdc7',
        traceUser: true,
      })
    }
    this.getUser()
    this.globalData = {}
  },
  getUser() {
    wx.cloud.callFunction({
      name: 'login'
    }).then((res) => {
      this.globalData.openid = res.result.openid;
    })
  },

})