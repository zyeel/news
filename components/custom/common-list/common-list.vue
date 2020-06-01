<template>
	<view @click="openDetail(item.item_id,item.title)">
		<view class="p-2 animated fast fadeIn">
			<!-- 标题 -->
			<view class="my-1" style="line-height: 1.4;"
			:class="fontSizeTitle">{{item.title}}</view>
			<!-- 图片 -->
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
			<!-- <image v-if="item.titlepic" :src="item.titlepic" style="
			height: 350rpx;" class="rounded w-100"></image> -->
			<!-- 新闻来源信息 -->
			<view class="flex align-center justify-start">
				<view class="mr-2" style="color: #999999;line-height: 1.3;" :class="fontSizeDetail">{{item.media_name}}</view>
				<view class="mr-2" style="color: #999999;line-height: 1.3;" :class="fontSizeDetail">{{item.comment_count}}评论</view>
				<text style="color: #999999;line-height: 1.3;" :class="fontSizeDetail">{{item.datetime}}</text>		
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
				return (this.fontSize=='big')?'font-md':((this.fontSize=='normal')?'font':'font-sm')
			},
			fontSizeDetail() {
				return (this.fontSize=='big')?'font':((this.fontSize=='normal')?'font-sm':'font-small')
			}
		},
		props:{
			item:Object,
			fontSize:String
		},
		methods:{
			//点击进入详情页面
			openDetail(news_id, title){
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
				//若已登录，则记录浏览历史
				var tabIndex=null;
				try{
					tabIndex = uni.getStorageSync('tabIndex');
					console.log(tabIndex);
				}catch(e){
					tabIndex=null;
					//TODO handle the exception
				}
				//添加到浏览数据库
				try {
					//获取用户信息
				    const user_id = uni.getStorageSync('user_id');
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
