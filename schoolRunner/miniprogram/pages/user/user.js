const db = wx.cloud.database();
const info = db.collection('info');

Page({
  data: {
    users: [] // 用于保存获取到的用户数据
  },

  onLoad() {
    // 页面加载时的其他操作
  },

  // 获取所有用户信息的函数
  showAllUsers() {
    info.get().then(res => {
      console.log('获取到的用户数据:', res.data);

      const users = res.data.map(user => {
        // 打印 updateTime，检查格式
        console.log('用户更新时间:', user.updateTime);
        
        // 将 updateTime 转换为更易读的格式
        let formattedUpdateTime = '未知';
        if (user.updateTime) {
          // 使用 Date.parse() 或 new Date() 解析时间
          const time = Date.parse(user.updateTime) || new Date(user.updateTime.replace('GMT+0800 (香港标准时间)', 'GMT+0800'));
          
          if (!isNaN(time)) { // 如果解析成功
            const date = new Date(time);
            formattedUpdateTime = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
          } else {
            console.error('无法解析用户的更新时间:', user.updateTime);
          }
        }

        return {
          nickName: user.nickName || '未命名用户',
          formattedUpdateTime: formattedUpdateTime,
          avatarUrl: user.avatarUrl || '/images/default-avatar.png' // 默认头像
        };
      });

      this.setData({
        users // 将获取到的用户数据保存到 users 变量中
      });
    }).catch(err => {
      console.error('获取用户信息失败:', err);
    });
  }
});