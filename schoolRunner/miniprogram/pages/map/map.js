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
        name: '吉林大学前卫南区东门', latitude: 43.824348, longitude: 125.289500,
        job: '校园导游兼职\n薪资：50元/小时\n联系方式：13800000001'
      },
      { 
        name: '吉林大学第三教学楼', latitude: 43.821938, longitude: 125.285201,
        job: '教学楼清洁兼职\n薪资：20元/小时\n联系方式：13800000002'
      },
      { 
        name: '吉林大学体育馆', latitude: 43.821002, longitude: 125.278593,
        job: '体育活动协助兼职\n薪资：30元/小时\n联系方式：13800000003'
      },
      { 
        name: '吉林大学校医院', latitude: 43.827526, longitude: 125.281398,
        job: '医疗助理兼职\n薪资：60元/小时\n联系方式：13800000004'
      },
      { 
        name: '吉林大学逸夫教学楼', latitude: 43.825058, longitude: 125.281594,
        job: '教学楼清洁兼职\n薪资：15元/小时\n联系方式：13800000005'
      },
      { 
        name: '吉林大学中心图书馆', latitude: 43.823205, longitude: 125.284070,
        job: '图书管理兼职\n薪资：25元/小时\n联系方式：13800000006'
      },
      { 
        name: '吉林大学鼎新图书馆', latitude: 43.825046, longitude: 125.269688,
        job: '图书管理兼职\n薪资：25元/小时\n联系方式：13800000020'
      },
      { 
        name: '吉林大学敬信教学楼', latitude: 43.819566, longitude: 125.271977,
        job: '实验室助理兼职，薪资：35元/小时，联系方式：13800000007'
      },
      { 
        name: '吉林大学数学学院', latitude: 43.822421, longitude: 125.288193,
        job: '数学学院助教兼职，薪资：40元/小时，联系方式：13800000008'
      },
      { 
        name: '吉林大学前卫南区湖畔餐厅', latitude: 43.820355, longitude: 125.274371,
        job: '食堂服务员兼职，薪资：18元/小时，联系方式：13800000009'
      },
      { 
        name: '吉林大学前卫四餐厅', latitude: 43.823007, longitude: 125.277027,
        job: '食堂后厨兼职，薪资：22元/小时，联系方式：13800000010'
      },
      { 
        name: '吉林大学前卫南区北苑一公寓', latitude: 43.825046, longitude: 125.273388,
        job: '宿舍管理兼职，薪资：20元/小时，联系方式：13800000011'
      },
      { 
        name: '吉林大学前卫南区南苑三公寓', latitude: 43.8196732, longitude: 125.277660,
        job: '宿舍清洁兼职，薪资：15元/小时，联系方式：13800000012'
      },
      { 
        name: '吉林大学匡亚明楼', latitude: 43.820910, longitude: 125.281073,
        job: '行政助理，薪资：45元/小时，联系方式：13800000013'
      },
      { 
        name: '吉林大学化学学院', latitude: 43.825612, longitude: 125.285001,
        job: '化学学院实验助理兼职，薪资：50元/小时，联系方式：13800000014'
      },
      { 
        name: '吉林大学法学楼', latitude: 43.822369, longitude: 125.2800038,
        job: '法学学院助理兼职，薪资：40元/小时，联系方式：13800000015'
      },
      { 
        name: '吉林大学艺术学院', latitude: 43.824425, longitude: 125.280481,
        job: '艺术学院助教兼职，薪资：35元/小时，联系方式：13800000016'
      },
      { 
        name: '吉林大学物理学院', latitude: 43.826112, longitude: 125.283501,
        job: '材物理院实验助理兼职，薪资：38元/小时，联系方式：13800000017'
      },
      { 
        name: '吉林大学王湘浩楼', latitude: 43.821407, longitude: 125.283127,
        job: '网络管理员，薪资：34元/小时，联系方式：13800000022'
      },
      { 
        name: '吉林大学前卫南区西门',latitude: 43.817786, longitude: 125.271777,
        job: '西门安保兼职，薪资：25元/小时，联系方式：13800000018'
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