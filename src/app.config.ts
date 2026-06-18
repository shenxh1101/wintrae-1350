export default defineAppConfig({
  pages: [
    'pages/pickup/index',
    'pages/students/index',
    'pages/leave/index',
    'pages/notify/index',
    'pages/history/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#2563EB',
    navigationBarTitleText: '托管班接送',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#9ca3af',
    selectedColor: '#2563EB',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/pickup/index',
        text: '今日接送'
      },
      {
        pagePath: 'pages/students/index',
        text: '学生档案'
      },
      {
        pagePath: 'pages/leave/index',
        text: '请假调班'
      },
      {
        pagePath: 'pages/notify/index',
        text: '通知反馈'
      },
      {
        pagePath: 'pages/history/index',
        text: '历史记录'
      }
    ]
  }
})
