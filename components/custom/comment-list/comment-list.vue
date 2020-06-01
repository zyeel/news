<template>
	<view>
		<view class="p-2 animated fast fadeIn">
			<!-- 个人信息 -->
			<view class="flex align-center justify-between">
			    <view class="flex align-center">
			        <image :src="avatar==''?'../../static/logo.png':avatar" class="mr-3 rounded-circle" :style="sizeOfAvatar" lazy-load></image>
			        <view>
			            <view :class="fontSizeUserName" style="line-height: 1.3;">{{item.username}}</view>
			            <text :class="fontSizeTimestamp" style="color: #9D9589;line-height: 1.3;">{{item.comment_timestamp}}</text>
			        </view>
			    </view>
			</view>
			<!-- 评论内容 -->
			<view class="my-1 mx-5" style="line-height: 1.4;"
			:class="fontSizeContent">{{item.content}}</view>
			<!-- 新闻来源信息、跳转按钮、删除按钮 -->		
			<view class="flex justify-between mx-5" :class="fontSizeContent">
				<!-- 链接 -->
				<view class="animated faster" hover-class="jello text-main">
				    <text class="iconfont icon-lianjie mr-2" :style="sizeOfIcon" @click="to_info"></text>
					<text :class="fontSizeUserName"  @click="to_info">{{!item.news_name?'':(item.news_name.length>16?item.news_name.slice(0,15)+"...":item.news_name)}}</text>
				</view>
			    <!-- 删除 -->
				<view class="animated faster" hover-class="jello text-main">
					<text class="iconfont icon-shanchu" @click="deleteComment" :style="sizeOfIcon"></text>
				</view>
			    
			</view>		
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
			};
		},
		computed:{
			fontSizeUserName() {
				return (this.fontSize=='big')?'font-md':((this.fontSize=='normal')?'font':'font-sm')
			},
			fontSizeContent() {
				return (this.fontSize=='big')?'font-lg':((this.fontSize=='normal')?'font-md':'font')
			},
			fontSizeTimestamp() {
				return (this.fontSize=='big')?'font-sm':((this.fontSize=='normal')?'font-small':'font-smaller')
			},
			sizeOfAvatar(){
				return (this.fontSize=='big')?'width: 85rpx;height: 85rpx;':((this.fontSize=='normal')?'width: 75rpx;height: 75rpx;':'width: 65rpx;height: 65rpx;')
			},
			sizeOfIcon(){
				return (this.fontSize=='big')?'font-size: 20px;':((this.fontSize=='normal')?'font-size: 15px;':'font-size: 10px;')
			},
		},
		props:{
			item:Object,
			fontSize:String,
			avatar: String,
		},
		methods:{
			//点击进入详情页面
			openDetail(news_id){
				uni.navigateTo({
					url:"../../pages/info/info?news_id=" + news_id
				})
			},

			deleteComment(){
				const user_id = uni.getStorageSync('user_id');
				uni.request({
				    url: 'https://af1o32.toutiao15.com/del_comment', //仅为示例，并非真实接口地址。
				    data: {
				        comment_id: this.item.comment_id,
						user_id: user_id
				    },
				    method:'POST',
				    success: (res) => {
						//console.log(res)
						this.$emit('refresh',this.item.comment_id);
				    }
				});
			},
			//点击进入详情页面
			to_info:function(){
				uni.navigateTo({
					url:"../../pages/info/info?news_id=" + this.item.news_id
				})
			}, 
		}
	}
</script>

<style>
	.support-active{
		color:#ED4040;
	}
</style>ht: 85rpx;':((this.fontSize=='normal')?'width: 65rpx;height: 65rpx;':'width: 65rpx;height: 65rpx;')
			}