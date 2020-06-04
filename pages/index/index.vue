<template>
	<view>
		<!-- 顶部选项卡 -->
		<scroll-view scroll-x class="scroll-row border-bottom" :scroll-into-view="scrollInto" scroll-with-animation="" style="height: 100rpx;"
		 :style="skinMode?'background-color: #F5F7F9;':'background-color: rgba(0,0,0,0.3)'">
			<view v-for="(item,index) in tabBars" :key="index" class="scroll-row-item px-3 py-2 font-md" :id="'tab'+index"
			 :class="tabIndex === index ? 'font-lg font-weight-bold '+textmain :''" @click="changeTab(index)">{{item.name}}</view>
		</scroll-view>
		<!-- 内容块滑动 -->
		<swiper :duration="150" :current="tabIndex" @change="onChangeTab" :style="'height:'+scrollH+'px;'+skin">
			<swiper-item v-for="(item1,index1) in tabBars" :key="index1">
				<scroll-view scroll-y="true" :style="'height:'+scrollH+'px;'" @scrolltolower="loadmore(index1)" @scrolltoupper="refresh(index1)">
					<template v-if="news_list[index1].list.length>0">
						<block v-for="(item2,index2) in news_list[index1].list" :key="index2">
							<common-list :item="item2" :index="index2" :fontSize="fontSize"></common-list>
							<divider></divider>
						</block>
						<load-more :loadmore="news_list[tabIndex].loadmore"></load-more>
					</template>
					<template v-else>
						<no-thing></no-thing>
					</template>
				</scroll-view>
			</swiper-item>
		</swiper>


	</view>
</template>

<script>
	import commonList from '@/components/custom/common-list/common-list.vue'
	import divider from '@/components/custom/divider/divider.vue'
	import noThing from '@/components/custom/no-thing/no-thing.vue'
	import loadMore from '@/components/custom/load-more/load-more.vue'
	export default {
		components: {
			commonList,
			divider,
			noThing,
			loadMore
		},
		computed: {
			skin() {
				return this.skinMode ? 'background-color: #ffffff;' : 'background-color: rgba(0,0,0,0.2);'
			},
			textmain() {
				return 'text-main' + this.text_main_index;
			}
		},
		data() {
			return {
				//用户id
				userID: '',
				//夜间模式
				skinMode: true,
				//字体大小
				fontSize: 'normal',
				theme_color: ["#ED4040", "#ffcc00", "#74b886", "#395ac6", "#ffbdbd", "#424242"],
				text_main_index: 0,
				//窗口高度
				scrollH: 600,
				scrollInto: "",
				//当前选项卡
				tabIndex: 0,
				//顶部选项卡
				tabBars: [{
					name: "热点",
					type: "news_hot"
				}, {
					name: "社会",
					type: "news_society"
				}, {
					name: "娱乐",
					type: "news_entertainment"
				}, {
					name: "科技",
					type: "news_tech"
				}, {
					name: "军事",
					type: "news_military"
				}, {
					name: "体育",
					type: "news_sports"
				}, {
					name: "汽车",
					type: "news_car"
				}, {
					name: "财经",
					type: "news_finance"
				}, {
					name: "国际",
					type: "news_world"
				}, {
					name: "时尚",
					type: "news_fashion"
				}, {
					name: "旅游",
					type: "news_travel"
				}, {
					name: "探索",
					type: "news_discovery"
				}, {
					name: "育儿",
					type: "news_baby"
				}, {
					name: "养生",
					type: "news_regimen"
				}, {
					name: "故事",
					type: "news_story"
				}, {
					name: "美文",
					type: "news_essay"
				}, {
					name: "游戏",
					type: "news_game"
				}, {
					name: "历史",
					type: "news_history"
				}, {
					name: "美食",
					type: "news_food"
				}],
				news_list: []
			}
		},
		onLoad() {
			//加载skinMode的值
			try {
				const value = uni.getStorageSync('skin_mode');
				if (value !== '') {
					this.skinMode = value
				}
			} catch (e) {
				// error
			}
			//加载userID
			try{
				const value = uni.getStorageSync("user_id");
				if(value !== ''){
					this.userID = value;
				}
			}catch(e){
				//TODO handle the exception
			}
			if(this.userID !== ''){
				//更新用户最喜爱的词语表
				uni.request({
					url: "https://af1o32.toutiao15.com/create_preflist",
					data:{
						user_id: this.userID,
					},
					method:"POST",
					success() {
					}
				})
				//更新推荐新闻
				uni.request({
					url:"https://af1o32.toutiao15.com/create_recommendation",
					data:{
						user_id: this.userID,
					},
					method:"POST",
				})
			}
			
			//修改底部tab
			if (this.skinMode) {
				uni.setTabBarStyle({
					color: '#333333',
					selectedColor: '#ED4040',
					backgroundColor: '#F5F3F4',
					borderStyle: 'back'
				})
			} else {
				uni.setTabBarStyle({
					color: '#333333',
					selectedColor: '#ED4040',
					backgroundColor: 'rgba(0,0,0,0.3)',
					borderStyle: 'back'
				})
			}
			//加载屏幕高度
			var res = uni.getSystemInfo({
				success: res => {
					this.scrollH = res.windowHeight - uni.upx2px(100);
				}
			})
			var arr = []
			for (let i = 0; i < this.tabBars.length; i++) {
				arr.push({
					loadmore: "上拉加载更多",
					list: [],
					firstLoad: false
				})
			}
			this.news_list = arr
			//保存当前的tabIndex值
			try {
				uni.setStorageSync('tabIndex', this.tabBars[this.tabIndex].name);
			} catch (e) {
				//TODO handle the exception
			};
			this.getData();
		},
		onShow() {
			console.log("index show")
			//加载skinMode的值
			try {
				const value = uni.getStorageSync('skin_mode');
				if (value !== '') {
					this.skinMode = value
				}
			} catch (e) {
				// error
			}
			//加载fontSize的值
			try {
				const value = uni.getStorageSync('font-size');
				if (value !== '') {
					this.fontSize = (value == 0) ? 'big' : ((value == 1) ? 'normal' : 'small')
				}
			} catch (e) {
				// error
			}
			//加载主题颜色
			try {
				var theme = uni.getStorageSync('theme_color');
				if (theme == '') {
					theme = 0;
				}
				this.text_main_index = theme;
				uni.setNavigationBarColor({
					frontColor: "#ffffff",
					backgroundColor: this.theme_color[theme]
				})
				//修改tabbar颜色
				uni.setTabBarItem({
					index: 0,
					selectedIconPath: "static/tabBar/homeed" + theme + ".png"
				})
				uni.setTabBarItem({
					index: 1,
					selectedIconPath: "static/tabBar/mineed" + theme + ".png"
				})
				uni.setTabBarStyle({
					selectedColor: this.theme_color[theme]
				})
			} catch (e) {
				// error
			}
			//修改评论数目
			let j = 0;
			let i = this.tabIndex
			for (; j < this.news_list[i].list.length; j = j + 1) {
				this.modifyCommentCount(i, j)
			}
		},
		//监听点击搜索栏
		onNavigationBarSearchInputClicked() {
			uni.navigateTo({
				url: '../search/search'
			})
		},
		methods: {
			//切换上方的状态栏时记录当前状态栏索引
			onChangeTab(e) {
				this.changeTab(e.detail.current);
			},
			//下拉刷新时重新获取数据
			refresh(i) {
				uni.showLoading({
					title: "加载中...",
					mask: false
				})
				uni.request({
					url: "https://m.toutiao.com/list/?ac=wap&format=json_raw&tag=" + this.tabBars[i].type +
						"&as=A175ADC1C1BAE7E&cp=5D118A3E877E8E1&_signature=f60bLAAAIr6R60RntmQLRn-tGz", //仅为示例，并非真实接口地址。
					header: {
						'Cookie': '__utma=252651093.67706439.1584015024.1584015024.1584015024.1; __utmz=252651093.1584015024.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); tt_webid=6803298091418437133; UM_distinctid=170cebb9dd6cd-094ddc63b2ac67-b781636-144000-170cebb9dd7431; _ga=GA1.2.315616392.1584016367; csrftoken=fa925c7e673269eff8dad21b09d1fbaf' //自定义请求头信息
					},
					success: (result) => {
						this.news_list[i].list = result.data.data
						//将新闻的id存入轻服务的数据库中
						let j = 0;
						for (; j < result.data.data.length; j = j + 1) {
							//console.log("loadmore",'https://af1o32.toutiao15.com/import_newsId?news_id='+result.data.data[j].item_id)
							uni.request({
									url: 'https://af1o32.toutiao15.com/import_news?news_id=' + result.data.data[j].item_id + "&news_name=" +
										result.data.data[j].title + "&tabIndex="+this.tabBars[i].name
								})
								.then(data => {
									var [error, res] = data;
									//console.log(res);
								})
						}
						//修改评论数目
						j = 0;
						for (; j < this.news_list[i].list.length; j = j + 1) {
							this.modifyCommentCount(i, j)
						}
						uni.hideLoading()
					}
				});
			},
			//上拉加载更多
			loadmore(index) {
				let item = this.news_list[index];
				if (item.loadmore !== '上拉加载更多') return;
				item.loadmore = "加载中";
				uni.request({
					url: "https://m.toutiao.com/list/?ac=wap&format=json_raw&tag=" + this.tabBars[index].type +
						"&as=A175ADC1C1BAE7E&cp=5D118A3E877E8E1&_signature=f60bLAAAIr6R60RntmQLRn-tGz", //仅为示例，并非真实接口地址。
					header: {
						'Cookie': '__utma=252651093.67706439.1584015024.1584015024.1584015024.1; __utmz=252651093.1584015024.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); tt_webid=6803298091418437133; UM_distinctid=170cebb9dd6cd-094ddc63b2ac67-b781636-144000-170cebb9dd7431; _ga=GA1.2.315616392.1584016367; csrftoken=fa925c7e673269eff8dad21b09d1fbaf' //自定义请求头信息
					},
					success: (result) => {
						let j = 0;
						for (; j < result.data.data.length; j = j + 1) {
							//console.log("loadmore",'https://af1o32.toutiao15.com/import_newsId?news_id='+result.data.data[j].item_id)
							uni.request({
									url: 'https://af1o32.toutiao15.com/import_news?news_id=' + result.data.data[j].item_id + "&news_name=" +
										result.data.data[j].title+ "&tabIndex="+this.tabBars[index].name
								})
								.then(data => {
									var [error, res] = data;
									//console.log(res);
								})
						}
						this.news_list[index].list = [...this.news_list[index].list, ...result.data.data];
						//修改评论数目
						j = 0;
						let i = this.tabIndex
						for (; j < this.news_list[i].list.length; j = j + 1) {
							this.modifyCommentCount(i, j)
						}
						item.loadmore = '上拉加载更多'
					}
				});
			},
			//切换上方的状态栏时记录当前状态栏索引
			changeTab(index) {
				if (this.tabIndex === index) {
					return;
				}
				try {
					uni.setStorageSync('tabIndex', this.tabBars[index].name);
				} catch (e) {
					//TODO handle the exception
				};
				this.tabIndex = index;
				this.scrollInto = 'tab' + index;
				this.getData();
			},
			//修改第i个类别的第j个新闻的评论数目,此函数是为了解决同步请求问题，只有当所有的新闻id导入到数据库后才可以从数据库读取评论数目
			modifyCommentCount(tabIndex, itemIndex) {
				uni.request({
					url: 'https://af1o32.toutiao15.com/get_news_info?news_id=' + this.news_list[tabIndex].list[itemIndex].item_id,
					success: (res) => {
						this.news_list[tabIndex].list[itemIndex].comment_count = res.data.comment_count
					}
				})
			},
			getData() {
				//console.log("https://m.toutiao.com/list/?ac=wap&format=json_raw&tag="+this.tabBars[this.tabIndex].type+"&as=A175ADC1C1BAE7E&cp=5D118A3E877E8E1&_signature=f60bLAAAIr6R60RntmQLRn-tGz")
				let i = this.tabIndex
				if (this.news_list[i].firstLoad == false) {
					uni.showLoading({
						title: "加载中...",
						mask: false
					})
					uni.request({
						url: "https://m.toutiao.com/list/?ac=wap&format=json_raw&tag=" + this.tabBars[i].type +
							"&as=A175ADC1C1BAE7E&cp=5D118A3E877E8E1&_signature=f60bLAAAIr6R60RntmQLRn-tGz", //仅为示例，并非真实接口地址。
						header: {
							'Cookie': '__utma=252651093.67706439.1584015024.1584015024.1584015024.1; __utmz=252651093.1584015024.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); tt_webid=6803298091418437133; UM_distinctid=170cebb9dd6cd-094ddc63b2ac67-b781636-144000-170cebb9dd7431; _ga=GA1.2.315616392.1584016367; csrftoken=fa925c7e673269eff8dad21b09d1fbaf' //自定义请求头信息
						},
						success: (result) => {
							this.news_list[i].list = result.data.data
							uni.hideLoading()

							//将新闻的id存入轻服务的数据库中
							let j = 0;
							for (; j < this.news_list[i].list.length; j = j + 1) {
								uni.request({
										url: 'https://af1o32.toutiao15.com/import_news?news_id=' + result.data.data[j].item_id + "&news_name=" +
											result.data.data[j].title+ "&tabIndex="+this.tabBars[i].name
									})
									.then(data => {})
							}

							//修改评论数目
							j = 0;
							for (; j < this.news_list[i].list.length; j = j + 1) {
								this.modifyCommentCount(i, j)
							}

						}
					});
					this.news_list[i].firstLoad = true
				}
			}
		}
	}
</script>

<style>

</style>
