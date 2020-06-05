<template>
	<view>
		<scroll-view scroll-y="true" :style="'height:'+scrollH+'px;'" @scrolltolower="loadmore()" @scrolltoupper="refresh()">
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
			var arr = {
				loadmore: "上拉加载更多",
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
					selectedIconPath: "static/tabBar/homeed" + theme + ".png"
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
			//修改评论数目
			let j=0;
			for(;j<this.news_list.list.length;j=j+1){
				this.modifyCommentCount(j);
			}
		},
		//监听点击搜索栏
		onNavigationBarSearchInputClicked() {
			uni.navigateTo({
				url: '../search/search'
			})
		},
		methods: {
			//下拉刷新时重新获取数据
			refresh() {
				console.log("refresh")
				uni.showLoading({
					title: "加载中...",
					mask: false
				}),
				uni.request({
					url:"https://af1o32.toutiao15.com/get_recommendation/?user_id="+this.user_id,
					method:"POST",
					success: (res) => {
						this.news_list.list=res.data.news_list;
						let j=0;
						for(;j<5;j=j+1){
							this.getInfo(j,res);
						}
						j=0;
						for (; j < 5; j = j + 1) {
							this.modifyCommentCount(j)
						}
						uni.hideLoading();
					}
				});
			},
			//上拉加载更多
			loadmore(){
				console.log("loadmore")
				let item = this.news_list;
				if (item.loadmore !== '上拉加载更多') return;
				item.loadmore = "加载中";
				uni.request({
					url:"https://af1o32.toutiao15.com/get_recommendation/?user_id="+this.user_id,
					method:"POST",
					success: (res) => {
						this.news_list.list=res.data.news_list;
						let j=0;
						for(;j<5;j=j+1){
							this.getInfo(j,res);
						}
						j=0;
						for (; j < 5; j = j + 1) {
							this.modifyCommentCount(j)
						}
						item.loadmore='上拉加载更多'
					}
				});
			},
			//修改第i个类别的第j个新闻的评论数目,此函数是为了解决同步请求问题，只有当所有的新闻id导入到数据库后才可以从数据库读取评论数目
			modifyCommentCount(itemIndex){
				uni.request({
					url: 'https://af1o32.toutiao15.com/get_news_info?news_id=' + this.news_list.list[itemIndex].news_id,
				}).then(data=>{
					var [error, res] = data;
					this.news_list.list[itemIndex].comment_count = res.data.comment_count
				})
			},
			getInfo(j,res){
				console.log("getInfo");
				uni.request({
					url:'https://m.toutiao.com/i' + res.data.news_list[j].news_id + '/info/?_signature=mvD7gBATx-10tqTLvd1hNJrw-5&i=' + res.data.news_list[j].news_id,
					method:"GET",
					success: (result) => {
						console.log(j)
						this.news_list.list[j].title=result.data.data.title;
						this.news_list.list[j].has_video=false;
						this.news_list.list[j].image_list=[];
						this.news_list.list[j].media_name=result.source;
						this.news_list.list[j].datetime=result.publish_time;
						this.news_list.list[j].comment_count=-1;
					}
				})
			},
			getData(){
				console.log("getData")
				if(this.news_list.firstLoad==false){
					uni.showLoading({
						title: "加载中...",
						mask: false
					}),
					uni.request({
						url:"https://af1o32.toutiao15.com/get_recommendation/?user_id="+this.user_id,
						method:"POST",
						success: (res) => {
							this.news_list.list=res.data.news_list;
							uni.hideLoading();
							console.log(this.news_list.list)
							let j=0;
							for(;j<5;j=j+1){
								this.news_list.list[j].item_id=this.news_list.list[j].news_id;
								this.getInfo(j,res);
							}
							j=0;
							for (; j < 5; j = j + 1) {
								this.modifyCommentCount(j)
							}
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
