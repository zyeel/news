<template>
	<view @click="openDetail(item.item_id,item.news_id,item.title,item.tabIndex)">
		<view class="p-2 animated fast fadeIn">
			<!-- 标题 -->
			<view class="my-1" style="line-height: 1.4;"
			:class="fontSizeTitle">{{item.title==null?item.news_name:item.title}}</view>
			<!-- 图片 -->
			<template v-if="item.has_video!=null">
				<template v-if="item.has_video==false&&item.image_list.length==0"></template>
				<template v-else-if="item.has_video==false&&item.image_list.length==1">
					<image v-for="image in item.image_list" :src="image.url"
					style="height: 360rpx;" class="rounded w-100 my-1"></image>
				</template>
				<template v-else-if="item.has_video==false&&item.image_list.length==3">
					<view class="flex align-center my-1">
						<image v-for="image in item.image_list" :src="image.url"
						style="width:260rpx; height: 160rpx; margin-left: 5rpx;margin-right: 5rpx;" class="rounded"></image>
					</view>
				</template>
				<template v-else>
					<!-- 视频图片 -->
					<image :src="item.large_image_url"
					style="height: 360rpx;" class="rounded w-100  my-1"></image>
				</template>
			</template>
			<!-- <image v-if="item.titlepic" :src="item.titlepic" style="
			height: 350rpx;" class="rounded w-100"></image> -->
			<!-- 新闻来源信息 -->
			<view class="flex align-center justify-start">
				<template v-if="item.media_name!=null">
				<view class="mr-2" style="color: #999999;line-height: 1.3;" :class="fontSizeDetail">{{item.media_name}}</view>
				</template>
				<template v-else>
				<view class="mr-2" style="color: #999999;line-height: 1.3;" :class="fontSizeDetail">{{item.source}}</view>
				</template>
				<view class="mr-2" style="color: #999999;line-height: 1.3;" :class="fontSizeDetail" v-if="item.tabIndex==null">{{item.comment_count}}评论</view>
				<template v-if="item.datetime!=null">
				<text style="color: #999999;line-height: 1.3;" :class="fontSizeDetail">{{item.datetime}}</text>	
				</template>
				<template v-else>
					<text style="color: #999999;line-height: 1.3;" :class="fontSizeDetail">{{timestampToTime_(item.publish_time)}}</text>
				</template>
			</view>			
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				isLogined:false
			};
		},
		computed:{
			fontSizeTitle() {
				return (this.fontSize=='big')?'font-lg':((this.fontSize=='normal')?'font-md':'font')
			},
			fontSizeDetail() {
				return (this.fontSize=='big')?'font-md':((this.fontSize=='normal')?'font':'font-sm')
			}
		},
		props:{
			item:Object,
			fontSize:String
		},
		methods:{
			//时间转换
			timestampToTime_(timestamp) {
				var date = new Date(timestamp * 1000); //timestamp 为10位需*1000，timestamp 为13位的话不需乘1000
				var Y = date.getFullYear() + '-';
				var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
				var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
				var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
				var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
				var s = ':'+(date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
				return Y + M + D + h + m;
			},
			//点击进入详情页面
			openDetail(item_id,news_id, title,tabIndex){
				if(item_id!=null && item_id!='undefined') news_id=item_id;
				try {
				    const login = uni.getStorageSync('isLogined');
				    if (login!=='') {
				        this.isLogined = login
				    }
				} catch (e) {
				    // error
				}
				//未登录，直接打开新闻详情
				if(this.isLogined==false){
					uni.navigateTo({
						url:"../../pages/info/info?news_id=" + news_id
					});
					return;
				}
				//获取用户信息
				const user_id = uni.getStorageSync('user_id');
				console.log(tabIndex);
				//若已登录，则记录浏览历史
				if(tabIndex==null){//非推荐页
					try{
						tabIndex = uni.getStorageSync('tabIndex');
						console.log(tabIndex);
					}catch(e){
						tabIndex=null;
						//TODO handle the exception
					}
				}
				else{
					console.log(news_id,user_id);
					uni.request({
						url:'https://af1o32.toutiao15.com/read_recommendation',
						method:"POST",
						data:{
							news_id : news_id,
							user_id : user_id,
						}
					})
				}
				//添加到浏览数据库
				try {
					if(user_id){
						uni.request({
							url:'https://af1o32.toutiao15.com/add_browsing',
							method:"POST",
							data:{
								news_id : news_id,
								user_id : user_id,
								title:title,
								tabIndex:tabIndex
							}
						})
					}
				} catch (e) {
				    // error
				}
				
				uni.navigateTo({
					url:"../../pages/info/info?news_id=" + news_id
				})
			},
		}
	}
</script>

<style>
	.support-active{
		color:#ED4040;
	}
</style>
