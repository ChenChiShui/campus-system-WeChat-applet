Page({
  data: {
    latitude: 39.9042,    // 初始地图中心的纬度（北京）
    longitude: 116.4074,  // 初始地图中心的经度（北京）
    markers: []           // 存储标记点的数组
  },

  onLoad() {
    // 手动定义一些静态标记点，并添加兼职信息
    const locations = [
      { 
        name: '吉林大学前卫南区正门', latitude: 43.822348, longitude: 125.284426,
        job: '校园导游兼职，薪资：50元/小时，联系方式：13800000001'
      },
      { 
        name: '吉林大学图书馆', latitude: 43.821938, longitude: 125.285201,
        job: '图书整理兼职，薪资：20元/小时，联系方式：13800000002'
      },
      { 
        name: '吉林大学体育馆', latitude: 43.823982, longitude: 125.282193,
        job: '体育活动协助兼职，薪资：30元/小时，联系方式：13800000003'
      },
      { 
        name: '吉林大学校医院', latitude: 43.820526, longitude: 125.287398,
        job: '医疗助理兼职，薪资：60元/小时，联系方式：13800000004'
      },
      { 
        name: '吉林大学第一教学楼', latitude: 43.823258, longitude: 125.283294,
        job: '教学楼清洁兼职，薪资：15元/小时，联系方式：13800000005'
      },
      { 
        name: '吉林大学第二教学楼', latitude: 43.822265, longitude: 125.283470,
        job: '教室管理兼职，薪资：25元/小时，联系方式：13800000006'
      },
      { 
        name: '吉林大学第三教学楼', latitude: 43.821759, longitude: 125.283686,
        job: '实验室助理兼职，薪资：35元/小时，联系方式：13800000007'
      },
      { 
        name: '吉林大学数学学院', latitude: 43.822821, longitude: 125.282693,
        job: '数学学院助教兼职，薪资：40元/小时，联系方式：13800000008'
      },
      { 
        name: '吉林大学前卫南区第二食堂', latitude: 43.821055, longitude: 125.284971,
        job: '食堂服务员兼职，薪资：18元/小时，联系方式：13800000009'
      },
      { 
        name: '吉林大学前卫南区第三食堂', latitude: 43.819807, longitude: 125.284327,
        job: '食堂后厨兼职，薪资：22元/小时，联系方式：13800000010'
      },
      { 
        name: '吉林大学前卫南区北苑宿舍', latitude: 43.824046, longitude: 125.285988,
        job: '宿舍管理兼职，薪资：20元/小时，联系方式：13800000011'
      },
      { 
        name: '吉林大学前卫南区南苑宿舍', latitude: 43.819732, longitude: 125.285660,
        job: '宿舍清洁兼职，薪资：15元/小时，联系方式：13800000012'
      },
      { 
        name: '吉林大学生命科学学院', latitude: 43.821410, longitude: 125.281773,
        job: '生命科学学院实验助理，薪资：45元/小时，联系方式：13800000013'
      },
      { 
        name: '吉林大学地质宫', latitude: 43.823112, longitude: 125.281301,
        job: '地质宫讲解员兼职，薪资：50元/小时，联系方式：13800000014'
      },
      { 
        name: '吉林大学化学学院', latitude: 43.821969, longitude: 125.282038,
        job: '化学学院实验助理兼职，薪资：40元/小时，联系方式：13800000015'
      },
      { 
        name: '吉林大学物理学院', latitude: 43.822625, longitude: 125.281481,
        job: '物理学院助教兼职，薪资：35元/小时，联系方式：13800000016'
      },
      { 
        name: '吉林大学材料学院', latitude: 43.821700, longitude: 125.280923,
        job: '材料学院实验助理兼职，薪资：38元/小时，联系方式：13800000017'
      },
      { 
        name: '吉林大学前卫南区东门', latitude: 43.821664, longitude: 125.287985,
        job: '东门安保兼职，薪资：25元/小时，联系方式：13800000018'
      }
    ];

    // 将静态数据映射为 markers 数组
    const markers = locations.map((location, index) => ({
      id: index,
      latitude: location.latitude,
      longitude: location.longitude,

      width: 30,
      height: 30,
      callout: {
        content: location.name,  // 地址名称
        fontSize: 12,
        borderRadius: 5,
        bgColor: "#ffffff",
        padding: 5,
        display: "ALWAYS"
      },
      job: location.job  // 添加兼职信息
    }));

    // 设置标记点和地图中心
    this.setData({
      markers: markers,
      latitude: locations[0].latitude,   // 地图中心设置为第一个标记点
      longitude: locations[0].longitude  // 地图中心设置为第一个标记点
    });
  },

  // 处理标记点点击事件
  onMarkerTap(e) {
    const markerId = e.markerId;
    const marker = this.data.markers[markerId];

    wx.showModal({
      title: marker.callout.content,
      content: `兼职信息：${marker.job}`,
      showCancel: false
    });
  }
});