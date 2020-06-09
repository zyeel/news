<template>
	
	<view>
		<uni-icons v-if="this.flag" :style="topc" type="arrowthinup" size="30" @tap="top()"></uni-icons>
		<scroll-view scroll-y="true" :style="'height:2000rpx;'+skin" :scroll-top="scrollTop" @scrolltolower="loadmore()" @scrolltoupper="refresh()" @scroll='scroll'>
			<template v-if="news_list.list.length>0">
				<block v-for="(item2,index2) in news_list.list" :key="index2">
					<common-list :item="item2" :index="index2" :fontSize="fontSize"></common-list>
					<divider></divider>
				</block>
				<load-more :loadmore="news_list.loadmore"></load-more>
			</template>
			<template v-else>
				<no-thing></no-thing>
			</template>
		</scroll-view>
	</view>
</template>



<script>
	import commonList from '@/components/custom/common-list/common-list.vue'
	import divider from '@/components/custom/divider/divider.vue'
	import noThing from '@/components/custom/no-thing/no-thing.vue'
	import loadMore from '@/components/custom/load-more/load-more.vue'
	import uniIcons from "@/components/uni-icons/uni-icons.vue"
	import uniFab from '@/components/uni-fab/uni-fab.vue'
	export default {
		components: {
			commonList,
			divider,
			noThing,
			loadMore,
			uniIcons,
			uniFab
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
				//夜间模式
				skinMode: true,
				//字体大小
				fontSize: 'normal',
				theme_color: ["#ED4040", "#ffcc00", "#74b886", "#395ac6", "#ffbdbd", "#424242"],
				text_main_index: 0,
				//窗口高度
				scrollH: 600,
				scrollInto: "",
				//用户id
				user_id:"",
				//回到顶部
				flag:false,
				scrollTop:-1,
				old:{scrollTop:0},
				topc:"position: fixed;z-index:99;right:20px; bottom:100px;",
				news_list: []
			}
		},
		onLoad(){
			//加载skinMode的值
			try {
				const value = uni.getStorageSync('skin_mode');
				if (value !== '') {
					this.skinMode = value
				}
			} catch (e) {
				// error
			}
			//获取用户id
			try{
				const value=uni.getStorageSync('user_id');
				if (value !== '') {
					this.user_id = value;
				}
			}catch(e){
				//error
			}
			//修改底部tab
			if (this.skinMode) {
				uni.setTabBarStyle({
					color: '#333333',
					backgroundColor: '#F5F3F4',
					borderStyle: 'back'
				})
			} else {
				uni.setTabBarStyle({
					color: '#333333',
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
			var arr = {
				loadmore: "已经到底了",
				list: [],
				firstLoad: false
			}
			this.news_list = arr
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
					iconPath: "static/tabBar/rcmd.png",
					selectedIconPath: "static/tabBar/rcmded" + theme + ".png"
				})
				uni.setTabBarItem({
					index: 2,
					selectedIconPath: "static/tabBar/mineed" + theme + ".png"
				})
				uni.setTabBarStyle({
					selectedColor: this.theme_color[theme]
				})
			} catch (e) {
				// error
			}
		},

		//监听点击搜索栏
		onNavigationBarSearchInputClicked() {
			uni.navigateTo({
				url: '../search/search'
			})
		},
		methods: {
			scroll(e){
				this.scrollTop=e.detail.scrollTop;
				if(e.detail.scrollTop>50){
					this.flag=true;
				}else{
					this.flag=false;
				}
			},
			//回到顶部
			top(){
				console.log("top")
				this.scrollTop = this.old.scrollTop
                this.$nextTick(function(){
                    this.scrollTop=0;
                });
				this.scrollTop=-1;
			},
			//下拉刷新时重新获取数据
			refresh() {
				console.log("refresh")
				uni.showLoading({
					title: "加载中...",
					mask: false
				}),
				console.log(this.user_id)
				uni.request({
					url:"https://af1o32.toutiao15.com/create_preflist",
					method:"POST",
					data:{
						user_id: this.user_id
					},
					success: (res) => {
						//console.log(res.data.news_list.length);
						console.log(1)
						uni.request({
							url:"https://af1o32.toutiao15.com/create_recommendation",
							method:"POST",
							data:{
								user_id: this.user_id
							},
							success: (res) => {
								console.log(2)
								uni.request({
									url:"https://af1o32.toutiao15.com/get_recommendation",
									method:"POST",
									data:{
										user_id: this.user_id
									},
									success: (res) => {
										this.news_list.list=res.data.news_list;
										console.log(3)
										uni.hideLoading();
									}
								});
							}
						});
					}
				});

				
			},
			//上拉加载更多
			// loadmore(){
			// 	console.log("loadmore")
			// 	let item = this.news_list;
			// 	if (item.loadmore !== '已经到底了') return;
			// 	item.loadmore = "加载中";
			// 	uni.request({
			// 		url:"https://af1o32.toutiao15.com/get_recommendation",
			// 		method:"POST",
			// 		data:{
			// 			user_id: this.user_id
			// 		},
			// 		success: (res) => {
			// 			this.news_list.list=res.data.news_list;
			// 			item.loadmore='上拉加载更多'
			// 		}
			// 	});
			// },

			getData(){
				console.log("getData")
				if(this.news_list.firstLoad==false){
					uni.showLoading({
						title: "加载中...",
						mask: false
					}),
					uni.request({
						url:"https://af1o32.toutiao15.com/get_recommendation",
						method:"POST",
						data:{
							user_id: this.user_id
						},
						success: (res) => {
							this.news_list.list=res.data.news_list;
							console.log(this.news_list.list.length)
							uni.hideLoading();

						},
					});
					this.news_list.firstLoad = true;
				}
			}
		},
	}
			
</script>

<style>

</style>
