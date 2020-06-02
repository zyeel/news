<template>
	<view class="container">
		<!-- 评论列表 -->
		<view class="bgColor" :style="skinMode?'':'background-color: rgba(0,0,0,0.2)'"></view>
		<view class="comments">
			<text class="comments_title">所有评论</text>
			<text class="sorting" @click="change_sorting_func">{{sorting_func}}</text>
			<view v-if="comment_count==0" class="no_comment">
				<text>暂无评论，快来添加评论吧</text>
			</view>
			<view v-else class="comments_list">
				<view class="comments_cell" v-for="(item,index) in comments" :key="index">
					<image class="user_avatar" :src="(item.avatar==''||item.avatar==undefined)?'../../static/logo.png':item.avatar" mode="scaleToFill"></image>
					<view class="comments_body">
						<view class="top">
							<text class="user_name">{{item.username}}</text>
							<view class="digg">
								<image :src="item.is_digg == 1?'../../static/comment_bar/like_1.png':'../../static/comment_bar/like_0.png'"
								 mode="aspectFit" class="comments_digg_img" @click="digg_comment(item)"></image>
								<text :class="['comments_digg_count',item.is_digg == 1?'change_color':'']" @click="digg_comment(item)">{{item.digg_count}}</text>
							</view>
						</view>
						<view class="comments_text" @click="comment_detail(item,index)" :class="fontSizeContent">{{item.content}}</view>
						<view class="bottom">
							<view class="time">
								<view class="comments_time">{{item.comment_timestamp | tsToTime}}</view>
								<text :class="item.reply_count!=0?'has_reply':'no_reply'" @click="comment_detail(item,index)">{{item.reply_count!=0?item.reply_count:''}}回复</text> 
							</view>
							<text v-if="user.user_id==item.user_id" class="delete_comment" @click="delete_comment(item,index)">删除</text>
						</view>
					</view>
				</view>
				<uni-load-more class="more_comments" :status="status" :contentText="contentText"></uni-load-more>
			</view>
		</view>

		<!-- 底部评论栏 -->
		<view class="comment_bar" :style="skinMode?'':'background-color: #b9b9b9; border-top: 1rpx solid #b5b5b5'">
			<!-- 输入框 -->
			<input type="text" class="comment_input" placeholder="写评论..." @click="popup_textarea" disabled="true"  :style="skinMode?'':'background-color: #d0d0d0'"/>
		</view>
		<!-- 输入弹框 -->
		<uni-popup type="bottom" ref="popup_textarea" >
			<view class="comment_bar_2" :style="skinMode?'':'background-color: #b9b9b9; border-top: 1rpx solid #b5b5b5'">
				<textarea class="comment_textarea" placeholder="写评论..." v-model="comment_content" :fixed="true"  :style="skinMode?'':'background-color: #d0d0d0'"/>
				<text :class="['send_comment',comment_content.length >= 1?'comment_active':'']" @click="send_comment">发布</text>
			</view>
		</uni-popup>  
	</view>

</template>

<script> 
	import {
		timestampToTime
	} from '../../timeset.js';
   
	export default {
		data() {
			return {
				comment_count: 0, //评论数
				news_id: '',
				load_num: 10, //每次加载评论数
				comments: [],
				more_comments: [],
				offset: 0, //偏移量（已加载评论数）
				status: 'noMore',
				contentText: {
					contentdown: "加载更多评论",
					contentrefresh: "正在加载...",
					contentnomore: "已显示全部评论"
				},
				comment_content: '', //文本框内容
				user:{},
				//夜间模式
				skinMode:true,
				//字体大小
				fontSize: 'normal',
				theme_color: ["#ED4040","#ffcc00","#74b886","#395ac6","#ffbdbd","#424242"],
				isLogined : false,
				sorting_id : 0,
				sorting_func : '按倒序'
			}
		},
		onLoad(e){
			this.news_id = e.news_id;
			this.comment_count = e.comment_count;
			//获取用户信息
			try {
			    const user_id = uni.getStorageSync('user_id');
				this.$set(this.user,'user_id',user_id);
				const username = uni.getStorageSync('username');
				this.$set(this.user,'username',username);
				const avatar = uni.getStorageSync('avatar');
				this.$set(this.user,'avatar',avatar);
			} catch (e) {
			    // error
			}
			uni.request({
				url: 'https://af1o32.toutiao15.com/get_comment2',
				method: "GET",
				data: {
					sort_id : this.sorting_id,
					news_id : this.news_id,
					user_id : this.user.user_id,
					count : this.load_num
				},
				success: res => {
					console.log(res);
					uni.setNavigationBarTitle({
						title: this.comment_count + "条评论"
					});
					this.comments = res.data.commentList;
					this.offset = this.comments.length;
					//有更多评论
					if (res.data.has_more == true) {
						this.status = 'more';
					}
				}  
			})
			//加载skinMode的值
			try {
			    const value = uni.getStorageSync('skin_mode');
			    if (value!=='') {
			        this.skinMode = value
			    }
			} catch (e) {
			    // error
			}
			//加载fontSize的值
			try {
			    const value = uni.getStorageSync('font-size');
			    if (value!=='') {
			        this.fontSize = (value==0)?'big':((value==1)?'normal':'small')
			    }
			} catch (e) {
			    // error
			}
		},
		onShow() {
			//获取用户信息
			try {
			    const user_id = uni.getStorageSync('user_id');
				this.$set(this.user,'user_id',user_id);
				const username = uni.getStorageSync('username');
				this.$set(this.user,'username',username);
				const avatar = uni.getStorageSync('avatar');
				this.$set(this.user,'avatar',avatar);
			} catch (e) {
			    // error
			}
			uni.request({
				url: 'https://af1o32.toutiao15.com/get_comment2',
				method: "GET",
				data: {
					sort_id : this.sorting_id,
					news_id : this.news_id,
					user_id : this.user.user_id,
					count : this.load_num
				},
				success: res => {
					//console.log(res);
					uni.setNavigationBarTitle({
						title: this.comment_count + "条评论"
					});
					this.comments = res.data.commentList;
					this.offset = this.comments.length;
					//有更多评论
					if (res.data.has_more == true) {
						this.status = 'more';
					}
				}  
			})
			//是否登录
			try {
			    const login = uni.getStorageSync('isLogined');
			    if (login!=='') {
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
		onReachBottom() {
			//console.log("到底了");
			this.loadMore();
		},
		computed:{
			fontSizeContent() {
				return (this.fontSize=='big')?'font-lg':((this.fontSize=='normal')?'font-md':'font')
			}
		}, 
		methods: {
			loadMore: function() {
				//console.log("加载更多");  
				if(this.status!='noMore'){
					this.status = 'loading';
					uni.request({
						url: 'https://af1o32.toutiao15.com/get_more_comment2',
						data: {
							sort_id : this.sorting_id,
							news_id : this.news_id,
							user_id : this.user.user_id,
							offset : this.offset,
							count : this.load_num,
							last_comment_id : this.comments[this.comments.length - 1]._id
						},
						method: 'GET',
						success: res => {
							console.log(res);
							//与评论列表连接
							this.more_comments = res.data.commentList;
							//console.log(this.more_comments);
							this.comments = this.comments.concat(this.more_comments);
							//console.log(this.comments);
							this.offset = this.comments.length;
							//更多评论
							if (res.data.has_more == false) {
								this.status = 'noMore';
							}else{
								this.status = 'more';
							}
						}
					});
				}
			},
			comment_detail:function(item,index){
				uni.navigateTo({
					url: '../comment/detail?news_id='+this.news_id+'&comment='+encodeURIComponent(JSON.stringify(item))
				})
			},
			digg_comment: function(item) {
				if(this.isLogined==false){
					uni.navigateTo({
						url:'../login/login'
					});
					return;
				}
				item.is_digg=(item.is_digg==1?0:1);
				if(item.is_digg){
					item.digg_count++;
					uni.request({
						url: 'https://af1o32.toutiao15.com/digg',
						method: "POST",
						data: {
							type:"comment",
							id:item._id,
							user_id:this.user.user_id,
							up_id:this.news_id
						}
					})
				}else{
					item.digg_count--;
					uni.request({
						url: 'https://af1o32.toutiao15.com/digg_cancel',
						method: "POST",
						data: {
							type:"comment",
							id:item._id,
							user_id:this.user.user_id,
						}
					})
				}
			},
			//点击输入框出现弹框
			popup_textarea:function(){
				if(this.isLogined==false){
					uni.navigateTo({
						url:'../login/login'
					});
					return;
				}
				this.$refs.popup_textarea.open();
				this.$refs.popup_textarea.maskClass['backgroundColor'] = 'rgba(0, 0, 0, 0)';
			},
			send_comment:function(){
				if(this.comment_content.length >= 1){ 
					//修改数据库
					uni.request({
						url:'https://af1o32.toutiao15.com/add_comment',
						data:{
							news_id : this.news_id,
							user_id : this.user.user_id,
							content : this.comment_content
						},  
						method:"POST",
						success: res => {
							//转化为倒序排序
							if(this.sorting_id!=0){
								this.sorting_id = 2;
								this.change_sorting_func();
							}
							//更新视图的评论列表
							//console.log(res)
							this.comments.unshift(res.data.comment);
							this.comment_count++;
							this.offset = this.comments.length;
							uni.setNavigationBarTitle({
								title: this.comment_count + "条评论"
							});
							uni.showToast({
								title:"评论成功",
								duration:2000,
								icon:"none"
							})	
						},
						fail: () => {
							uni.showToast({
								title:"评论失败",
								duration:2000,
								icon:"none"
							})
						}
					})
					this.comment_content=''; 
					this.$refs.popup_textarea.close();
				}
			},
			delete_comment:function(item,index){
				uni.showModal({
				    title: '提示',
				    content: '确认删除此评论？',
					confirmColor:"#F45858",
				    success: res => {
				        if (res.confirm) {
				            console.log(item._id);
							uni.request({
								url:'https://af1o32.toutiao15.com/del_comment',
									data:{
										comment_id : item._id
									},
									method:"POST",
									success: res => {
										//console.log(res);
										this.comments.splice(index,1);
										this.comment_count--;
										this.offset = this.comments.length;
										uni.setNavigationBarTitle({
											title: this.comment_count + "条评论"
										});
										console.log("删除成功")
									},
									fail: () => {
										console.log("删除失败")
									}
								})
				        } else if (res.cancel) {
				            console.log('取消');
				        }
				    }
				});
			},
			change_sorting_func:function(){
				if(this.sorting_id==0){
					this.sorting_id = 1;
					this.sorting_func = '按正序';
				}else if(this.sorting_id==1){
					this.sorting_id = 2;
					this.sorting_func = '按热度';
				}else if(this.sorting_id==2){
					this.sorting_id = 0;
					this.sorting_func = '按倒序';
				}
				uni.request({
					url: 'https://af1o32.toutiao15.com/get_comment2',
					method: "GET",
					data: {
						sort_id : this.sorting_id,
						news_id : this.news_id,
						user_id : this.user.user_id,
						count : this.load_num
					},
					success: res => {
						//console.log(res);
						uni.setNavigationBarTitle({
							title: this.comment_count + "条评论"
						});
						this.comments = res.data.commentList;
						this.offset = this.comments.length;
						//有更多评论
						if (res.data.has_more == true) {
							this.status = 'more';
						}
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
		padding: 0;
		position: absolute;
		padding-bottom: 60px;
	}

	.container {
		padding: 20px;
	}
	
	.bgColor{
	    position: fixed;
	    top: 0;
	    left: 0;
	    right: 0;
	    bottom: 0;
	    z-index: -1;
	}

	.comments_title {
		font-size: 16px;
		font-weight: 800;
	}
	
	.sorting{
		color: #5c73a9;
		float: right;
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
	
	.comments_body .bottom {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 3px;
	}
	.time{
		display: flex;
		align-items: center;
	}
	.comments_time {
		font-size: 12px;
		color: #909090;
	} 
	.no_reply{ 
		font-size: 11px;
		margin-left: 10rpx;
	}
	.has_reply{
		font-size: 11px;
		margin-left: 15rpx;
		padding: 8rpx 20rpx;
		background-color: #eaeaea;
		border-radius: 30rpx;
	}
	.delete_comment{
		font-size: 11px;
	} 
    
	.more_comments {
		margin: 20px 0 45px;
	}

	.change_color {
		color: #F45858;
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
		width: 650rpx;
		font-size: 14px;
		border-color: #e3e3e3;
		border-radius: 18px;
		line-height: 30px; 
	} 
	.comment_bar_2{
		height: 220rpx; 
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
	.comment_textarea{
		background-color: #f3f3f3;
		padding: 8px;
		height: 60px;
		width: 580rpx;
		font-size: 14px; 
		border-color: #e3e3e3;
		border-radius: 10px;
	}
	.send_comment{
		margin-left: 25rpx;
		font-size: 15px;
		font-weight: 700;
		color: #d0d0d0;
	}
	.comment_active{
		color: #F45858;
	}
</style>
