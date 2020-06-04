<template>
	<view class="container">
		<view class="bgColor" :style="skinMode?'':'background-color: rgba(0,0,0,0.2)'"></view>
		<view class="title" :class="fontSizeTitle">{{title}}</view>
		<view class="infomation">
			<view class="author">{{author}}</view>
			<view class="time">{{time | tsToTime}}</view>
		</view>
		<view class="content">
			<video class="video_s" v-if="has_video" :src="video_source" :poster="video_poster"></video>
			<!--<rich-text :nodes="news_content"></rich-text>-->
			<u-prase :content="news_content" ></u-prase>
		</view>

		<!-- 部分评论 -->
		<view class="comments">
			<text class="comments_title">精选评论</text>
			<view v-if="comment_count==0" class="no_comment">
				<text>暂无评论，快来添加评论吧</text>
			</view>
			<view v-else class="comments_list">
				<view class="comments_cell" v-for="(item,index) in comments" :key="index">
					<image class="user_avatar" :src="(item.avatar==''||item.avatar==undefined)?'../../static/logo.png':item.avatar"
					 mode="scaleToFill"></image>
					<view class="comments_body">
						<view class="top">
							<text class="user_name">{{item.username}}</text>
							<view class="digg">
								<image :src="item.is_digg == 1?'../../static/comment_bar/like_1.png':'../../static/comment_bar/like_0.png'"
								 mode="aspectFit" class="comments_digg_img" @click="digg_comment(item)"></image>
								<text :class="['comments_digg_count',item.is_digg == 1?'change_color':'']" @click="digg_comment(item)">{{item.digg_count}}</text>
							</view>
						</view>
						<view class="comments_text" @click="to_comment" :class="fontSizeContent">{{item.content}}</view>
						<view class="comments_time">{{item.comment_timestamp | tsToTime}}</view>
					</view>
				</view>
				<view class="more_comments" @click="to_comment">查看更多评论</view>
			</view>
		</view>

		<!-- 底部评论栏 -->
		<view class="comment_bar" :style="skinMode?'':'background-color: #b9b9b9; border-top: 1rpx solid #b5b5b5'">
			<!-- 输入框 -->
			<input type="text" class="comment_input" placeholder="写评论..." @click="to_comment" disabled="false" :style="skinMode?'':'background-color: #d0d0d0'" />
			<!-- 评论点赞收藏转发 -->
			<image src="../../static/comment_bar/comment.png" mode="aspectFit" class="comment_bar_img" @click="click_comment"></image>
			<!-- 评论数角标 -->
			<text class="comment_count">{{comment_count_display}}</text>
			<image :src="isDigg==1?'../../static/comment_bar/like_1.png':'../../static/comment_bar/like_0.png'" mode="aspectFit"
			 class="comment_bar_img" @click="digg_news"></image>
			<image :src="isStar==1?'../../static/comment_bar/star_1.png':'../../static/comment_bar/star_0.png'" mode="aspectFit"
			 class="comment_bar_img" @click="click_collection"></image>
			<!-- 点赞数角标 -->
			<text :class="['digg_count',isDigg==1?'change_color':'']">{{digg_count_display}}</text>
			<image src="../../static/comment_bar/share.png" mode="aspectFit" class="comment_bar_img" @click="Share()"></image>
		</view>
	</view>
</template>

<script>
	import {
		timestampToTime
	} from '../../timeset.js';
	import uPrase from "../../components/feng-parse/parse.vue"
	
	export default {
		components:{
			uPrase
			},
		data() {
			return {
				title: '',
				author: '',
				time: '',
				news_content: '',
				isDigg: 0,
				isStar: 0,
				comment_count: 0, //评论数
				digg_count: 0, //点赞数
				link: '',
				con: '',
				comments: [],
				news_id: '6700770496872448525', //列表页获取
				user: {},
				//夜间模式
				skinMode: true,
				//字体大小
				fontSize: 'normal',
				theme_color: ["#ED4040", "#ffcc00", "#74b886", "#395ac6", "#ffbdbd", "#424242"],
				isLogined: false,
				video_id:'',
				video_source: '',
				video_poster:'',
				has_video: false
			}
		},
		onLoad(e) {
			this.news_id = e.news_id;
			//获取用户信息
			try {
				const user_id = uni.getStorageSync('user_id');
				this.$set(this.user, 'user_id', user_id);
				const username = uni.getStorageSync('username');
				this.$set(this.user, 'username', username);
				const avatar = uni.getStorageSync('avatar');
				this.$set(this.user, 'avatar', avatar);
			} catch (e) {
				// error
			}
			//获取新闻详情
			uni.request({
				url: 'https://m.toutiao.com/i' + this.news_id + '/info/?_signature=mvD7gBATx-10tqTLvd1hNJrw-5&i=' + this.news_id,
				method: "GET",
				data: {},
				success: res => {
					this.link = res.data.data.url;
					//console.log(res);
					this.title = res.data.data.title;
					this.author = res.data.data.detail_source;
					//console.log(this.author);
					this.time = res.data.data.publish_time;
					this.news_content = res.data.data.content.replace(/<img/gi, '<img style="max-width: 100%;"').replace(
						/<html><body>/gi, '').replace(/<\/body><\/html>/gi, "").replace(/<p>/gi, '<p style="margin:16px 0;font-size:'+((this.fontSize == 'big') ? '40rpx' : ((this.fontSize == 'normal') ? '35rpx' : '30rpx'))+';">');
					
					if(this.news_content.search(/tt-videoid/) != -1){
						//获取视频
						this.has_video = true;
						this.video_id = this.news_content.substr(this.news_content.search(/tt-videoid/)+12, 32);
						this.video_poster = this.news_content.substr(this.news_content.search(/tt-poster/)+11, this.news_content.search(/视频加载中.../)-2-this.news_content.search(/tt-poster/)-11);
						this.news_content = this.news_content.replace(/视频加载中.../gi, '');
						//console.log(this.video_id);
						//console.log(this.video_poster);
						this.getVideo(this.video_id);
					}
					this.con = res.data.data.content.replace(/<[a-zA-Z][^>]*>/gi, '').replace(/[</][a-zA-Z][^>]*>/gi, '').replace(
						/</gi, '');
					this.con = this.con.replace(/\\[a-zA-Z]/gi, '');
					this.con = this.con.replace(/[\n]+/gi, '');
					this.con = this.con.substr(0, 50);
					//this.comment_count = res.data.data.comment_count;
					uni.setNavigationBarTitle({
						title: this.author
					});
				}
			})
			//获取新闻点赞数评论数收藏状态
			uni.request({
				url: 'https://af1o32.toutiao15.com/get_news_info',
				method: "GET",
				data: {
					news_id: this.news_id,
					user_id: this.user.user_id
				},
				success: res => {
					this.digg_count = res.data.digg_count;
					this.comment_count = res.data.comment_count;
					this.isDigg = res.data.is_digg;
					this.isStar = res.data.is_star;
				}
			})
			//获取精选评论
			uni.request({
				url: 'https://af1o32.toutiao15.com/get_top_comment',
				method: "GET",
				data: {
					news_id: this.news_id,
					user_id: this.user.user_id,
					count: 5
				},
				success: res => {
					//console.log(res);
					this.comments = res.data.commentList;
					//console.log(this.comments);
				}
			})
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
		},
		onShow() {
			//获取用户信息
			try {
				const user_id = uni.getStorageSync('user_id');
				this.$set(this.user, 'user_id', user_id);
				const username = uni.getStorageSync('username');
				this.$set(this.user, 'username', username);
				const avatar = uni.getStorageSync('avatar');
				this.$set(this.user, 'avatar', avatar);
			} catch (e) {
				// error
			}
			//获取新闻点赞数评论数收藏状态
			uni.request({
				url: 'https://af1o32.toutiao15.com/get_news_info',
				method: "GET",
				data: {
					news_id: this.news_id,
					user_id: this.user.user_id
				},
				success: res => {
					this.digg_count = res.data.digg_count;
					this.comment_count = res.data.comment_count;
					this.isDigg = res.data.is_digg;
					this.isStar = res.data.is_star;
				}
			})
			//获取精选评论
			uni.request({
				url: 'https://af1o32.toutiao15.com/get_top_comment',
				method: "GET",
				data: {
					news_id: this.news_id,
					user_id: this.user.user_id,
					count: 5
				},
				success: res => {
					//console.log(res);
					this.comments = res.data.commentList;
				}
			})
			//是否登录
			try {
				const login = uni.getStorageSync('isLogined');
				if (login !== '') {
					this.isLogined = login
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
				uni.setNavigationBarColor({
					frontColor: "#ffffff",
					backgroundColor: this.theme_color[theme]
				})
			} catch (e) {
				// error
			}
		},
		onNavigationBarButtonTap(e) {
			if (e.index == 0) {
				console.log('111');
				this.Share();
			}
			if (e.index == 1) {}
		},
		computed: {
			//处理评论数显示
			comment_count_display: function() {
				if (this.comment_count >= 100000) {
					return String(parseInt((this.comment_count / 10000))) + '万';
				} else if (this.comment_count >= 10000) {
					return String((parseInt((this.comment_count / 10000) * 10) / 10).toFixed(1)) + '万';
				} else {
					return String(this.comment_count);
				}
			},
			//处理点赞数显示
			digg_count_display: function() {
				if (this.digg_count >= 100000) {
					return String(parseInt((this.digg_count / 10000))) + '万';
				} else if (this.digg_count >= 10000) {
					return String((parseInt((this.digg_count / 10000) * 10) / 10).toFixed(1)) + '万';
				} else {
					return String(this.digg_count);
				}
			},
			fontSizeTitle() {
				return (this.fontSize == 'big') ? 'h3' : ((this.fontSize == 'normal') ? 'font-lg' : 'font-md')
			},
			fontSizeContent() {
				return (this.fontSize == 'big') ? 'font-lg' : ((this.fontSize == 'normal') ? 'font-md' : 'font')
			}
		},
		methods: {
			click_comment: function() {
				//滑动到评论处
				uni.createSelectorQuery().select(".container").boundingClientRect(data => {
					uni.createSelectorQuery().select(".comments").boundingClientRect((res) => {
						uni.pageScrollTo({
							duration: 100,
							scrollTop: res.top - data.top - 10
						})
					}).exec()
				}).exec();
			},
			digg_comment: function(item) {
				if (this.isLogined == false) {
					uni.navigateTo({
						url: '../login/login'
					});
					return;
				}
				item.is_digg = (item.is_digg == 1 ? 0 : 1);
				if (item.is_digg) {
					item.digg_count++;
					uni.request({
						url: 'https://af1o32.toutiao15.com/digg',
						method: "POST",
						data: {
							type: "comment",
							id: item._id,
							user_id: this.user.user_id,
							up_id: this.news_id
						}
					})
				} else {
					item.digg_count--;
					uni.request({
						url: 'https://af1o32.toutiao15.com/digg_cancel',
						method: "POST",
						data: {
							type: "comment",
							id: item._id,
							user_id: this.user.user_id,
						}
					})
				}
			},
			digg_news: function() {
				if (this.isLogined == false) {
					uni.navigateTo({
						url: '../login/login'
					});
					return;
				}
				console.log(this.isDigg)
				this.isDigg = (this.isDigg == 1 ? 0 : 1);
				if (this.isDigg) {
					this.digg_count++;
					uni.request({
						url: 'https://af1o32.toutiao15.com/digg',
						method: "POST",
						data: {
							type: "news",
							id: this.news_id,
							user_id: this.user.user_id
						}
					})
				} else {
					this.digg_count--;
					uni.request({
						url: 'https://af1o32.toutiao15.com/digg_cancel',
						method: "POST",
						data: {
							type: "news",
							id: this.news_id,
							user_id: this.user.user_id
						}
					})
				}
			},
			click_collection: function() {
				if (this.isLogined == false) {
					uni.navigateTo({
						url: '../login/login'
					});
					return;
				}
				this.isStar = (this.isStar == 1 ? 0 : 1);
				uni.request({
					url: 'https://af1o32.toutiao15.com/collection',
					method: "POST",
					data: {
						news_id: this.news_id,
						user_id: this.user.user_id
					},
					success: res => {
						console.log(res);
					}
				})
			},
			to_comment: function() {
				uni.navigateTo({
					url: '../comment/comment?news_id=' + this.news_id + '&comment_count=' + this.comment_count
				});
			},
			Share: function() {
				//console.log(this.title);
				let data = {
					title: this.title,
					content: this.con,
					link: this.link
				};
				uni.$emit('shareMsg', data);

				const subNVue = uni.getSubNVueById("share_page");
				subNVue.show();
			},
			closeShare: function() {
				console.log("111");
			},
			getVideo(id){
				uni.request({
					url:'https://af1o32.toutiao15.com/get_video',
					method:'GET',
					data:{
						video_id: id
					},
					success: res=>{
						//console.log(res);
						this.video_source = res.data;
						//console.log(this.video_source);
					}
				})
			}
		},
		filters: {
			tsToTime(ts) {
				return timestampToTime(ts);
			}
		}
	}
</script>

<style>
	.outside {
		width: 100%;
		height: 100%;
		padding: 0;
		position: absolute;
		padding-bottom: 60px;
	}

	.container {
		padding: 20px;
		font-size: 14px;
		line-height: 24px;
		position: relative;
		padding-bottom: 60px;
		min-height: 30px;
	}

	.bgColor {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: -1;
	}

	.title {
		line-height: 40px;
		font-weight: 700;
		/*font-size: 38rpx;*/
		text-align: justify;
	}

	.infomation {
		line-height: 30px;
		font-size: 12px;
		color: #8d8d8d;
		display: flex;
	}

	.author {
		margin: 5px 5px 5px 0;
	}

	.time {
		margin: 5px 5px 5px 5px;
	}

	.content {
		line-height: 30px;
		/*font-size: 16px;*/
		text-align: justify;
	}

	/*精选评论*/
	.comments {
		margin-top: 25px;
	}

	.comments_title {
		font-size: 16px;
		font-weight: 800;
	}

	.no_comment {
		font-size: 15px;
		text-align: center;
		color: #909090;
		margin: 30px 0;
	}

	.comments_cell {
		margin-top: 12px;
		display: flex;
	}

	.user_avatar {
		width: 75rpx;
		height: 75rpx;
		border-radius: 75rpx;
		margin-top: 5px;
	}

	.comments_body {
		width: 85%;
		margin-left: 20rpx;
	}

	.comments_body .top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 3px;
		width: 100%;
	}

	.comments_body .top .digg {
		display: flex;
		align-items: center;
	}

	.user_name {
		font-size: 14px;
		color: #4a79cf;
	}

	.comments_digg_img {
		width: 40rpx;
		height: 40rpx;
	}

	.comments_digg_count {
		font-size: 13px;
		color: #707070;
	}

	.comments_text {
		/*font-size: 15px;*/
		line-height: 25px;
		text-align: justify;
	}

	.comments_time {
		font-size: 12px;
		color: #909090;
		margin-top: 3px;
	}

	.more_comments {
		margin-top: 20px;
		font-size: 15px;
		color: #3F536E;
		text-align: center;
	}

	/*底部评论栏*/
	.comment_bar {
		height: 45px;
		width: 750rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		position: fixed;
		left: 0;
		bottom: 0;
		border-top: 1rpx solid #eeeeee;
		background-color: #FFFFFF;
	}

	.comment_input {
		background-color: #f3f3f3;
		margin-right: 10rpx;
		padding-left: 20rpx;
		height: 30px;
		width: 340rpx;
		font-size: 14px;
		border-color: #e3e3e3;
		border-radius: 18px;
		line-height: 30px;
	}

	.comment_bar_img {
		will-change: transform;
		width: 60rpx;
		height: 60rpx;
		margin-left: 25rpx;
	}

	.comment_count {
		position: absolute;
		left: 455rpx;
		top: 7px;
		font-size: 8px;
		color: #FFFFFF;
		background-color: #F45858;
		text-align: center;
		min-height: 12px;
		min-width: 15rpx;
		line-height: 12px;
		border-radius: 12px;
		padding: 0 6rpx;
	}

	.digg_count {
		position: absolute;
		left: 538rpx;
		top: 7px;
		font-size: 8px;
		color: #707070;
		text-align: center;
		min-height: 12px;
		min-width: 15rpx;
		line-height: 12px;
		border-radius: 12px;
		padding: 0 6rpx;
	}

	.change_color {
		color: #F45858;
	}
	.video_s{
		display: block;
		margin: auto;
	}
</style>
