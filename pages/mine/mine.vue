<template>
	<view :style="'height:'+scrollH+'px;'" :class="skinMode?'sl-main-bg':'sd-main-bg'">
		<view class="flex align-center py-2 px-4" hover-class="bg-light" @click="toNewPage">
			<image :src="avatar==''?'../../static/logo.png':avatar" style="width: 120rpx; height: 120rpx;" class="rounded-circle"></image>
			<view class="flex flex-column flex-1 px-2">
				<text class="font-weight-normal text-dark" :class="fontSize?'font-md':'font'">{{this.username}}</text>
				<text class="font-sm text-muted">{{signature}}</text>
			</view>
		</view>
		<template v-if="isLogined">
			<view class="flex align-center px-3 py-2">
				<view class="flex-1 flex flex-column align-center justify-center" @click="toCommentList">
					<text class="font-md font-weight-normal">评论</text>
					<text class="font-sm text-muted">{{myData[0].number}}</text>
				</view>
				<view class="flex-1 flex flex-column align-center justify-center" @click="toDiggList">
					<text class="font-md font-weight-normal">点赞</text>
					<text class="font-sm text-muted">{{myData[1].number}}</text>
				</view>
				<view class="flex-1 flex flex-column align-center justify-center" @click="toCollectList">
					<text class="font-md font-weight-normal">收藏</text>
					<text class="font-sm text-muted">{{myData[2].number}}</text>
				</view>
			</view>
		</template>

		<view class="m-3">
			<uni-list class="rounded" style="font-size: 10px;">
				<view class="uni-list-cell" :class="skinMode?'sl-list':'sd-list'">
					<view class="uni-list-cell-left">
						字体大小
					</view>
					<view class="uni-list-cell-db">
						<picker @change="bindPickerChange" :value="index" :range="array" range-key="name">
							<view class="uni-input" style="padding-left: 400rpx; background-color: rgba(0,0,0,0);">{{array[index].name}}</view>
						</picker>
					</view>
				</view>
				<template v-if="!skinMode">
					<view class="line"></view>
				</template>
				<view class="uni-list-cell" :class="skinMode?'sl-list':'sd-list'">
					<view class="uni-list-cell-left">
						主题颜色
					</view>
					<view class="uni-list-cell-db">
						<picker @change="bindPickerChange2" :value="index2" :range="array2" range-key="name">
							<view class="uni-input" style="padding-left: 400rpx; background-color: rgba(0,0,0,0);">{{array2[index2].name}}</view>
						</picker>
					</view>
				</view>
				<template v-if="!skinMode">
					<view class="line"></view>
				</template>
				<uni-list-item title="夜间模式" :show-switch="true" :show-arrow="false" @switchChange="changeSkinMode" :switchChecked="!skinMode"
				 :class="skinMode?'sl-list':'sd-list'"></uni-list-item>
				<uni-list-item title="使用报告" :class="skinMode?'sl-list':'sd-list'" @click="toReport" v-if="isLogined"></uni-list-item>
				<uni-list-item title="意见反馈" :class="skinMode?'sl-list':'sd-list'"></uni-list-item>
			</uni-list>
		</view>

	</view>
</template>

<script>
	import wButton from '../../components/watch-login/watch-button.vue' //button
	import uniListItem from '@/components/uni-list-item/uni-list-item.vue'
	import uniList from '@/components/uni-list/uni-list.vue'
	export default {
		components: {
			uniListItem,
			uniList
		},
		data() {
			return {
				//字体大小可选值
				array: [{
					name: '大'
				}, {
					name: '中'
				}, {
					name: '小'
				}],
				//选中的字体大小
				index: 1,
				//主题颜色可选值
				array2: [{
					name: '红'
				}, {
					name: '黄'
				}, {
					name: '绿'
				}, {
					name: '蓝'
				}, {
					name: '粉'
				}, {
					name: '黑'
				}],
				//选中的主题颜色
				index2: 0,
				theme_color: ["#ED4040", "#ffcc00", "#74b886", "#395ac6", "#ffbdbd", "#424242"],
				//屏幕高度
				username: '',
				avatar: '',
				scrollH: 600,
				fontSize: "normal",
				skinMode: true,
				isLogined: false,
				signature: '',
				//
				myData: [{
						name: "评论",
						number: 1
					},
					{
						name: "点赞",
						number: 1
					}, {
						name: "收藏",
						number: 1
					}, {
						name: "历史",
						number: 1
					}
				]
			}
		},
		onNavigationBarButtonTap(e) {
			if (e.index == 0) {
				//console.log('111');
				//this.toConfig();
			}
			if (e.index == 1) {

			}
		},
		onLoad() {
			//加载屏幕高度
			var res = uni.getSystemInfo({
				success: res => {
					this.scrollH = res.windowHeight;
				}
			})
			try {
				const logined = uni.getStorageSync('isLogined');
				this.isLogined = logined;
				if (this.isLogined == true) {
					console.log('111');
				} else if (this.isLogined == false) {
					console.log('22222222');
				}
			} catch (e) {
				this.isLogined = false;
			}

			try {
				const value = uni.getStorageSync('signature');
				if (value === '' || value === undefined) {
					this.signature = '这个人很神秘，什么都没留下';
				} else {
					this.signature = value;
				}
			} catch (e) {
				//TODO handle the exception
				this.signature = '这个人很神秘，什么都没留下';
			}

			try {
				/*const username = uni.getStorageSync('username');
				if(username){
					this.username = username;
					console.log(this.username);
				}else{
					this.username = '神秘人';
				}*/
				if (this.isLogined == true) {
					this.username = uni.getStorageSync('username');
				} else {
					this.username = '神秘人';
				}
				const avatar = uni.getStorageSync('avatar');
				if (avatar) {
					this.avatar = avatar;
				} else {
					this.avatar = '../../static/logo.png';
				}
			} catch (e) {
				this.username = '神秘人';
			}
			//加载skinMode的值
			try {
				const value = uni.getStorageSync('skin_mode');
				if (value !== '') {
					this.skinMode = value
				} else {

				}
			} catch (e) {
				// error
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
			//加载fontSize的值
			try {
				const value = uni.getStorageSync('font-size');
				if (value !== '') {
					console.log(value)
					this.index = value
				}
			} catch (e) {
				// error
			}
		},
		onShow() {
			console.log("mine show")
			//获取评论数目
			const value = uni.getStorageSync('user_id');
			uni.request({
				url: 'https://af1o32.toutiao15.com/getTotalSizeByUid', //仅为示例，并非真实接口地址。
				data: {
					user_id: value,
				},
				method: 'POST',
				success: (res) => {
					this.myData[0].number = res.data.result
				}
			});
			//获取点赞数目
			uni.request({
				url: "https://af1o32.toutiao15.com/getDiggByUid",
				data: {
					user_id: value,
				},
				method: 'POST',
				success: (res) => {
					this.myData[1].number = res.data.result.length;
				},
			});
			//获取收藏数目
			uni.request({
				url: "https://af1o32.toutiao15.com/getCollectByUid",
				data: {
					user_id: value,
				},
				method: 'POST',
				success: (res) => {
					this.myData[2].number = res.data.result.length;
				},
			});

			try {
				try {
					const value = uni.getStorageSync('signature');
					if (value === '' || value === undefined) {
						this.signature = '这个人很神秘，什么都没留下';
					} else {
						this.signature = value;
					}
				} catch (e) {
					//TODO handle the exception
					this.signature = '这个人很神秘，什么都没留下';
				}
				const logined = uni.getStorageSync('isLogined');
				this.isLogined = logined;
				if (this.isLogined == true) {
					//console.log('111');
				} else if (this.isLogined == false) {
					//console.log('22222222');
				}
			} catch (e) {
				this.isLogined = false;
			}
			try {
				if (this.isLogined == true) {
					this.username = uni.getStorageSync('username');
				} else {
					this.username = '神秘人';
				}
				const avatar = uni.getStorageSync('avatar');
				if (avatar) {
					this.avatar = avatar;
				} else {
					this.avatar = '../../static/logo.png';
				}
			} catch (e) {
				this.username = '神秘人';
			}

			//主题色
			try {
				var theme = uni.getStorageSync('theme_color');
				if (theme == '') {
					theme = 0;
				}
				this.index2 = theme;
				//修改tabbar颜色
				uni.setTabBarItem({
					index: 0,
					selectedIconPath: "static/tabBar/homeed" + this.index2 + ".png"
				})
				uni.setTabBarItem({
					index: 1,
					selectedIconPath: "static/tabBar/mineed" + this.index2 + ".png"
				})
				uni.setTabBarStyle({
					selectedColor: this.theme_color[this.index2]
				})
			} catch (e) {
				// error
			}
		},
		methods: {
			bindPickerChange: function(e) {
				console.log('picker发送选择改变，携带值为：' + e.detail.value)
				this.index = e.detail.value
				try {
					uni.setStorageSync('font-size', this.index);
				} catch (e) {
					// error
				}
			},
			bindPickerChange2: function(e) {
				console.log('picker发送选择改变，携带值为：' + e.detail.value)
				this.index2 = e.detail.value
				try {
					uni.setStorageSync('theme_color', this.index2);
				} catch (e) {
					// error
				}
				//修改tabbar颜色
				uni.setTabBarItem({
					index: 0,
					selectedIconPath: "static/tabBar/homeed" + this.index2 + ".png"
				})
				uni.setTabBarItem({
					index: 1,
					selectedIconPath: "static/tabBar/mineed" + this.index2 + ".png"
				})
				uni.setTabBarStyle({
					selectedColor: this.theme_color[this.index2]
				})
			},
			toNewPage() {
				//console.log(this.isLogined);
				if (this.isLogined) {
					this.toUpdate();
				} else {
					this.toLogin();
				}
			},
			toLogin() {
				uni.navigateTo({
					url: '../login/login'
				})
			},
			toUpdate() {
				uni.navigateTo({
					url: '../update/update'
				})
			},
			toCommentList() {
				uni.navigateTo({
					url: "../myComment/myComment"
				});
			},
			toDiggList() {
				uni.navigateTo({
					url: "../myDigg/myDigg"
				});
			},
			toCollectList() {
				uni.navigateTo({
					url: "../myCollect/myCollect"
				});
			},
			toReport() {
				uni.navigateTo({
					url: "../report/report"
				});
			},
			//切换夜间模式
			changeSkinMode(e) {
				this.skinMode = !e.value
				try {
					uni.setStorageSync('skin_mode', this.skinMode);
				} catch (e) {
					// error
				}
				//设置导航栏与下方的tab
				if (!e.value) {
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
			},
		}
	}
</script>

<style>
	@import url("../../components/watch-login/css/icon.css");

	.line {
		background-color: #E6E3E3;
		height: 1px;
	}

	.logout_button {
		background-color: rgba(254, 0, 0, 0.7);
		height: 80rpx;
		width: 600rpx;
		border-radius: 30rpx;
		font-size: 40upx;
		color: #FFFFFF;
		text-align: center;
		vertical-align: middle;
		line-height: 70rpx;
		opacity: 0.85;
		box-shadow: 0 8rpx 16rpx 0 rgba(0, 0, 0, 0.2);
	}

	.logout_button:active {
		background-color: #dd4f45;
		height: 80rpx;
		width: 600rpx;
		border-radius: 30rpx;
		font-size: 40upx;
		color: #FFFFFF;
		text-align: center;
		vertical-align: middle;
		line-height: 70rpx;
		box-shadow: 0 12rpx 16rpx 0 rgba(0, 0, 0, 0.24);
	}

	.logout_outer {
		height: 100rpx;
		width: 100%;
		margin-top: 100rpx;

	}
</style>
