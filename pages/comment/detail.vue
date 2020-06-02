<template>
	<view class="detail">
		<view class="bgColor" :style="skinMode?'':'background-color: rgba(0,0,0,0.2)'"></view>
		<view class="main">
			<!-- 评论 -->
			<view class="comments_cell">
				<image class="user_avatar" :src="(comment.avatar==''||comment.avatar==undefined)?'../../static/logo.png':comment.avatar"
				 mode="scaleToFill"></image>
				<view class="comments_body">
					<view class="top">
						<text class="user_name">{{comment.username}}</text>
						<view class="digg">
							<image :src="comment.is_digg == 1?'../../static/comment_bar/like_1.png':'../../static/comment_bar/like_0.png'"
							 mode="aspectFit" class="comments_digg_img" @click="digg_comment(comment)"></image>
							<text :class="['comments_digg_count',comment.is_digg == 1?'change_color':'']" @click="digg_comment(comment)">{{comment.digg_count}}</text>
						</view>
					</view>
					<text :class="['comments_text', (fontSize=='big')?'font-lg':((fontSize=='normal')?'font-md':'font')]">{{comment.content}}</text>
					<view class="bottom">
						<text class="comments_time">{{comment.comment_timestamp | tsToTime}}</text>
					</view>
				</view>
			</view>
	
			<!-- 评论回复 -->
			<view class="reply">
				<text class="reply_title">全部回复({{reply_count}})</text>
				<view v-if="reply_count==0" class="no_reply">
					<text>暂无回复</text>
				</view>
				<!-- 回复列表 -->
				<view v-else class="reply_list">
					<view class="comments_cell" v-for="(item,index) in reply" :key="index">
						<image class="user_avatar" :src="(item.owner_avatar==''||item.owner_avatar==undefined)?'../../static/logo.png':item.owner_avatar"
						 mode="scaleToFill"></image>
						<view class="comments_body">
							<view class="top">
								<text class="user_name">{{item.owner_username}}</text>
								<view class="digg">
									<image :src="item.is_digg == 1?'../../static/comment_bar/like_1.png':'../../static/comment_bar/like_0.png'"
									 mode="aspectFit" class="comments_digg_img" @click="digg_reply(item)"></image>
									<text :class="['comments_digg_count',item.is_digg == 1?'change_color':'']" @click="digg_reply(item)">{{item.digg_count}}</text>
								</view>
							</view>
							<text :class="['comments_text', (fontSize=='big')?'font-lg':((fontSize=='normal')?'font-md':'font')]">{{item.content}}</text>
							<view class="bottom">
								<view class="time">
									<text class="comments_time">{{item.reply_timestamp | tsToTime}}</text>
									<text class="reply_reply" @click="reply_reply(item)">回复</text>
								</view>
								<text v-if="user.user_id==item.owner_user_id" class="delete_comment" @click="delete_reply(item,index)">删除</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	
		<!-- 底部回复栏 -->
		<view class="comment_bar" :style="skinMode?'':'background-color: #b9b9b9; border-top: 1rpx solid #b5b5b5'">
			<!-- 输入框 -->
			<input type="text" class="comment_input" placeholder="回复..." @click="popup_textarea" disabled="true" :style="skinMode?'':'background-color: #d0d0d0'" />
		</view>
		<!-- 输入弹框 -->
		<uni-popup type="bottom" ref="popup_textarea">
			<view class="comment_bar_2" :style="skinMode?'':'background-color: #b9b9b9; border-top: 1rpx solid #b5b5b5'">
				<textarea adjust-position="false" class="comment_textarea" :placeholder="'回复'+replied_name+'...'"
				 v-model="reply_content" :style="skinMode?'':'background-color: #d0d0d0'"/>
				<text :class="['send_comment',reply_content.length >= 1?'comment_active':'']" @click="send_reply">发布</text>
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
				news_id : '',
				comment : {},
				reply : [] ,//评论回复
				reply_count : 0,
				reply_content:'',
				replied_name : '', //被回复用户名
				to_reply_id : '',//被回复的回复的id
				user:{},
				//夜间模式
				skinMode:true,
				//字体大小
				fontSize: 'normal',
				theme_color: ["#ED4040","#ffcc00","#74b886","#395ac6","#ffbdbd","#424242"],
				isLogined : false
			}
		},
		onLoad(e){
			this.news_id = e.news_id;
			const comment = JSON.parse(decodeURIComponent(e.comment));
			this.comment = comment;
			this.reply_count = comment.reply_count;
			uni.setNavigationBarTitle({
				title: this.reply_count + "条回复"
			});
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
			//接口请求评论的回复
			uni.request({
				url: 'https://af1o32.toutiao15.com/get_reply_news',
				method: "GET", 
				data: {
					user_id:this.user.user_id,
					comment_id:this.comment._id
				},
				success: res => {
					//console.log(res);
					this.load_reply(res.data.replyList);
				}  
			})
		},
		onShow(){
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
			//更新评论的点赞状态
			uni.request({
				url: 'https://af1o32.toutiao15.com/get_one_comment_digg',
				method: "GET", 
				data: {
					user_id:this.user.user_id,
					comment_id:this.comment._id
				},
				success: res => {
					if(res.data.status==1){
						this.comment.is_digg = 1;
					}
				}  
			})
			//接口请求评论的回复
			uni.request({
				url: 'https://af1o32.toutiao15.com/get_reply_news',
				method: "GET", 
				data: {
					user_id:this.user.user_id,
					comment_id:this.comment._id
				},
				success: res => {
					//console.log(res);
					this.load_reply(res.data.replyList);
				}  
			})
		},
		methods: {
			load_reply:function(replyList){
				this.reply = replyList;
				//console.log(this.reply)
			},
			close_detail:function(){
				uni.navigateTo({
					url:'../comment/comment'
				})
			},
			digg_comment: function(comment) {
				if(this.isLogined==false){
					uni.navigateTo({
						url:'../login/login'
					});
					return;
				}
				comment.is_digg=(comment.is_digg==1?0:1);
				if(comment.is_digg){
					comment.digg_count++;
					uni.request({
						url: 'https://af1o32.toutiao15.com/digg',
						method: "POST",
						data: {
							type:"comment",
							id:comment._id,
							user_id:this.user.user_id,
							up_id:this.news_id
						}
					})
				}else{
					comment.digg_count--;
					uni.request({
						url: 'https://af1o32.toutiao15.com/digg_cancel',
						method: "POST",
						data: {
							type:"comment",
							id:comment._id,
							user_id:this.user.user_id,
						}
					})
				}
			},
			digg_reply: function(item) {
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
							type:"reply",
							id:item._id,
							user_id:this.user.user_id,
							up_id:this.comment._id
						}
					})
				}else{
					item.digg_count--;
					uni.request({
						url: 'https://af1o32.toutiao15.com/digg_cancel',
						method: "POST",
						data: {
							type:"reply",
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
				this.replied_name = this.comment.username;
				this.focus = true;
			},
			send_reply:function(){
				if(this.reply_content.length >= 1){
					uni.request({
						url:'https://af1o32.toutiao15.com/add_reply',
						data:{
							news_id : this.news_id,
							comment_id : this.comment._id,
							to_reply_id : this.to_reply_id,
							send_user_id : this.comment.user_id,
							owner_user_id : this.user.user_id,
							content : this.reply_content
						},  
						method:"POST",
						success: res => {
							//更新视图的评论列表  
							//console.log("test",res)
							this.reply.unshift(res.data.reply);
							this.reply_count++;
							uni.setNavigationBarTitle({
								title: this.reply_count + "条回复"
							});
							uni.showToast({
								title:"回复成功",
								duration:2000,
								icon:"none"
							})	
						},
						fail: () => {
							uni.showToast({
								title:"回复失败",
								duration:2000,
								icon:"none"
							})
						}
					})
					this.reply_content='';
					this.to_reply_id='';
					this.$refs.popup_textarea.close();
					
				}
			},
			delete_reply:function(item,index){
				uni.showModal({
				    title: '提示',
				    content: '确认删除此回复？',
					confirmColor:"#F45858",
				    success: res => {
				        if (res.confirm) {
				            console.log(item._id);
							uni.request({
								url:'https://af1o32.toutiao15.com/del_reply_one',
									data:{
										reply_id : item._id
									},
									method:"POST",
									success: res => {
										//console.log(res);
										this.reply.splice(index,1);
										this.reply_count--;
										uni.setNavigationBarTitle({
											title: this.reply_count + "条回复"
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
			reply_reply:function(item){
				if(this.isLogined==false){
					uni.navigateTo({
						url:'../login/login'
					});
					return;
				}
				this.$refs.popup_textarea.open();
				this.$refs.popup_textarea.maskClass['backgroundColor'] = 'rgba(0, 0, 0, 0)';
				this.replied_name = item.owner_username;
				this.focus = true;
				this.to_reply_id = item.owner_user_id;
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
	.detail{
		padding:0 40rpx;
	}
	.bgColor{
	    position: fixed;
	    top: 0;
	    left: 0;
	    right: 0;
	    bottom: 0;
	    z-index: -1;
	}
	.main{
		margin-top: 30rpx;
	}
	.comments_cell {
		display: flex;
		margin-top: 20rpx;
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
	.reply_reply{
		font-size: 26rpx;
		margin-left: 10rpx;
	}
	.delete_comment{
		font-size: 26rpx;
	}
	.change_color {
		color: #F45858;
	}
	/*回复列表*/
	.reply{
		margin-top: 20rpx;
		margin-bottom: 120rpx;
	}
	.reply_title{
		font-size: 34rpx;
		font-weight: 700;
	}
	.no_reply {
		font-size: 32rpx;
		text-align: center;
		color: #909090;
		margin-top: 20rpx;
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
