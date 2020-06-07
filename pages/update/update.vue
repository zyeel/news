<template>
	<view>
		<view class="bgColor" :style="skinMode?'background-color: #f5f7f9':'background-color: rgba(0,0,0,0.2)'"></view>
		<view class="avatar_outer">
			<image :src="avatar==''?'../../static/logo.png':avatar" 
			style="width: 130rpx; height: 130rpx; ;"
			class="rounded-circle"
			@click="confirmAvtar">
			</image>
		</view>
		<view class="text_outer" @click="popup_textarea">
			<text style=" bacolor: #777777; font-size: 40upx; margin-left: 50rpx;">昵称</text>
			<view class="username_outer">
				<text style="display: inline-block; color: #777777; font-size: 40upx;">{{username}}</text>
				<view class="iconfont icon-arrow-right" style="display: inline-block; font-size: 40upx; color: #777777;"></view>
			</view>
		</view>
			
		<view class="text_outer" @click="popup_textarea1">
			<text style=" bacolor: #777777; font-size: 40upx; margin-left: 50rpx;">个性签名</text>
			<view class="username_outer">
				<text style="display: inline-block; color: #777777; font-size: 35upx;">{{short_signature}}</text>
				<view class="iconfont icon-arrow-right" style="display: inline-block; font-size: 40upx; color: #777777;"></view>
			</view>
		</view>
		<view class="logout_outer">
			<button
			@click="Logout"
			class="logout_button"
		>退出登录</button>
		</view>
		
		<uni-popup type="bottom" ref="popup_textarea" >
			<view class="update_bar" :style="skinMode?'':'background-color: #b9b9b9; border-top: 1rpx solid #b5b5b5'">
				<textarea class="update_textarea" placeholder="昵称..." v-model="username" :fixed="true"  :style="skinMode?'':'background-color: #d0d0d0'"/>
				<text :class="['send_username',username.length >= 1?'username_active':'']" @click="confirmUsername" >修改</text>
			</view>
		</uni-popup>  
		
		<uni-popup type="bottom" ref="popup_textarea1" >
			<view class="update_bar" :style="skinMode?'':'background-color: #b9b9b9; border-top: 1rpx solid #b5b5b5'">
				<textarea class="update_textarea" placeholder="个性签名..." v-model="signature" :fixed="true"  :style="skinMode?'':'background-color: #d0d0d0'"/>
				<text :class="['send_username',signature.length >= 1?'username_active':'']" @click="confirmSignature" >修改</text>
			</view>
		</uni-popup>  
	</view>
</template>

<script>
	import {
		pathToBase64,
		base64ToPath,
	}from '../../index.js'
	
	export default {
		data() {
			return {
				userId:'',
				username: 'aaa',
				skinMode: true,
				avatar: '',
				signature: '',
				short_signature: '',
			}
		},
		async onLoad() {
			try{
				const value = uni.getStorageSync('signature');
				if(value === '' || value === undefined){
					this.signature = '这个人很神秘，什么都没留下';
				}
				else{
					this.signature = value;
				}
			}catch(e){
				//TODO handle the exception
				this.signature = '这个人很神秘，什么都没留下';
			}
			this.short_signature = this.signature.substr(0, 8) + '...';
			try{
				const value = uni.getStorageSync('user_id');
				this.userId = value;
			}catch(e){
				//TODO handle the exception
			}
			try{
				const value = uni.getStorageSync('avatar');
				//console.log('1');
				if(value){
					this.avatar = value;
					//console.log('111');
					//console.log(this.avatar);
				}else{
					this.avatar = '../../static/logo.png';
				}
			}catch(e){
				//TODO handle the exception
			}
			try{
				const value = uni.getStorageSync('skin_mode');
				if(value!==''){
					this.skinMode = value;
				}
			}catch(e){
				//TODO handle the exception
			}
			try{
				const value = uni.getStorageSync('username');
				this.username = value;
			}catch(e){
				//TODO handle the exception
			}
			//await this.request();
			console.log(this.username);
		},
		onNavigationBarButtonTap(e) {
			if (e.index == 0) {
				console.log('111');
				uni.redirectTo({
					url:"../mine/mine",
				})
			}
			if (e.index == 1) {
			}
		},
		methods: {
			/*request: async function() {
			    var [error, res] = await uni.request({
			        url: 'https://af1o32.toutiao15.com/get_usr_info',
					method:'POST',
					data:{
						user_id: this.userId,
					},
					success: res => {
						this.username = res.data.username;
						this.avatar = res.data.avatar;
						console.log(this.username);
					}
			    });
			    console.log(res.data);
			},*/
			
			//修改昵称
			updateUsername: function(){
				return new Promise((resolve, reject)=>{
					uni.request({
						url: 'https://af1o32.toutiao15.com/update_username',
						method: 'POST',
						data: {
							user_id: this.userId,
							username: this.username,
						},
						success: res => {
							//console.log(res);
							resolve('suc');
						},
						fail: (err) => {
							reject('err');
						}
					});
				})
			},
			
			async confirmUsername(){
				await this.updateUsername();
				try{
					console.log(this.username);
					uni.setStorageSync('username', this.username);
				}catch(e){
					//TODO handle the exception
				}
				this.$refs.popup_textarea.close();
			},
			
			//修改个性签名
			updateSignature: function(){
				return new Promise((resolve, reject)=>{
					uni.request({
						url: 'https://af1o32.toutiao15.com/update_signature',
						method: 'POST',
						data: {
							user_id: this.userId,
							signature: this.signature,
						},
						success: res => {
							//console.log(res);
							resolve('suc');
						},
						fail: (err) => {
							reject('err');
						}
					});
				})
			},
			
			async confirmSignature(){
				if(this.signature.length>20){
					uni.showToast({
						icon: "none",
						position: "bottom",
						title: "最多只能输入20个字！",
					})
				}
				else{
					await this.updateSignature();
					try{
						uni.setStorageSync('signature', this.signature);
						this.short_signature = this.signature.substr(0, 8)+'...';
					}catch(e){
					//TODO handle the exception
					}
					this.$refs.popup_textarea1.close();
				}
				
			},
			
			//头像
			updateAvatar: function(){
				return new Promise((resolve, reject)=>{
					uni.request({
						url: 'https://af1o32.toutiao15.com/update_avatar',
						method: 'POST',
						data: {
							user_id: this.userId,
							username: this.avatar,
						},
						success: res => {
							//console.log(res);
							resolve('suc');
						},
						fail: (err) => {
							reject('err');
						}
					});
				})
			},
			
			async confirmAvtar(){
				uni.chooseImage({
					count: 1,
					success: (res) => {
						pathToBase64(res.tempFilePaths[0]).then(base64 =>{
							this.avatar = base64;
							//console.log(this.avatar);
							uni.request({
								url: 'https://af1o32.toutiao15.com/update_avatar',
								method: 'POST',
								data: {
									user_id: this.userId,
									avatar: this.avatar,
								},
								success: res => {
									uni.setStorageSync('avatar', this.avatar);
								},
							});
						}).catch(error=>{
							console.error(error);
						})
					}
				})
			},
			
			//弹出修改昵称的弹窗
			popup_textarea: function(){
				this.$refs.popup_textarea.open();
				this.$refs.popup_textarea.maskClass['backgroundColor'] = 'rgba(0, 0, 0, 0)';
			},
			
			//弹出修改个性签名的弹窗
			popup_textarea1: function(){
				this.$refs.popup_textarea1.open();
				this.$refs.popup_textarea1.maskClass['backgroundColor'] = 'rgba(0, 0, 0, 0)';
			},
			
			//退出登录
			startLogout: function(){
				return new Promise((resolve, reject)=>{
					uni.request({
						url:"https://af1o32.toutiao15.com/usr_logout",
						data:{
							user_id: this.user_id
						},
						success: res => {
							resolve('suc');
						},
						fail: err => {
							reject('err');
						}
					})
				})
			},
			async Logout() {
				try{
					const userId = uni.getStorageSync("user_id");
					this.user_id = userId;
				}catch(e){
					//TODO handle the exception
				}
				await this.startLogout();
				try{
					uni.setStorageSync("isLogined", false);
					uni.removeStorageSync("username");
					//uni.setStorageSync("username", "");
					uni.removeStorageSync("user_id", "");
					//uni.setStorageSync("user_id", "");
					uni.removeStorageSync("avatar", "");
					//uni.setStorageSync("avatar", "");
					uni.removeStorageSync("signature", "");
				}catch(e){
					
				};
				uni.switchTab({
					url:"../mine/mine"
				});
			}
		}
	}
</script>

<style>
	.avatar_outer{
		display: flex;
		flex-direction: row;
		height: 300rpx;
		top:200rpx;
		justify-content: center;
		align-items: center;
	}
	.text_outer{
		display: flex;
		flex-direction: row;
		top:150rpx;
		height: 100rpx;
		justify-content: space-between;
		align-items: center;
		background-color: #FFFFFF;
	}
	.username_outer{
		
		width:auto;
		margin-right: 50rpx;
		
	}
	.bgColor{
		position: fixed;
	    top: 0;
	    left: 0;
	    right: 0;
	    bottom: 0;
	    z-index: -1;
	}
	@font-face {font-family: "iconfont";
	  src: url('data:application/x-font-woff2;charset=utf-8;base64,d09GMgABAAAAAAJ0AAsAAAAABiQAAAIpAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHEIGVgCCcAooRgE2AiQDCAsGAAQgBYRtBzUbcQXILqEc2ykkYNZgQfEGhH5yiyXCIR7+26/dN392F/Okmjh08SSaVBslkaB0CJ3SCUUzefd/Lg/YqDx/LIHQF/JbTl+akZqa01PqhNw09wTPEKC6ZO4l4m9xPfSFHr8smn2ey+lNoAOZH+hcrzlprEmTBlAvDijQPTCKrIQybhi74AU+JlCnV1lyeba5JAoye1UgHh1LSxQKUVlmhRqh3HAwi1clNek5xUv0/fgzEzUkpYLdsnU9NRODL05JcXWHASFGQMdLKDAtIRN7jdkNacG4tLpsxqDEsRqDL9Vq4BFHdQr219n1DaAb5oIv3koBEjwWZbh+0lai/HTro9k7vH4t2383j36W3hOBYP2Nava/pj6Dz2/kyIb5qdnMF3y+OnAgG1rbnbKmNo4n5cO21alDFQ62+Zxq67xWMdTonOCv6MlQqDFMZnYaJfVmUVZjDnWmzI/Xa8fSItdi0htAaPGOpMkHCi3uZGY/UNLlH2UtUaDOQXBhvdG4K8WoCZqgv4BjUKhcr5TixhNaD77GeW3E35BjJwGNar1cmGOIvMSW+NFqiihQTAHMwHPo+wQRk4uGVG2RqFWrqaY3VQ0KEiVLGNIIZAK6F8BhICEVTBalyudPkOWBT8MdfXXlDWIxZ3bQUFUfQM5N4aC+R3kl9sjSJIQCFEYCYAbmIZ+PgKh5ngsZRJU9IR1pqTmj1FBTdXtL8HenoI5tT+HsLNSfMdNThR3LlkQCAA==') format('woff2');
	}
	
	.iconfont {
	  font-family: "iconfont" !important;
	  font-size: 16px;
	  font-style: normal;
	  -webkit-font-smoothing: antialiased;
	  -moz-osx-font-smoothing: grayscale;
	}
	
	.icon-arrow-right:before {
	  content: "\e743";
	}
	
	.update_bar{
		height: 220rpx;
		width: 750rpx; 
		display: flex;
		justify-content: center;
		align-items: center;
		position: fixed; 
		left: 0;
		bottom: 0;
		border-top: 1rpx solid #eeeeee;
		background-color: #f5f7f9;
	}
	
	.update_textarea{
		background-color: #f3f3f3;
		padding: 8px;
		height: 60px;
		width: 580rpx;
		font-size: 14px; 
		border-color: #e3e3e3;
		border-radius: 10px;
	}
	
	.send_username{
		margin-left: 25rpx;
		font-size: 15px;
		font-weight: 700;
		color: #d0d0d0;
	}
	
	.username_active{
		color: #F45858;
	}
	
	.logout_button{
		 background-color: rgba(254,0,0,0.7);
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
	.logout_button:active{
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
	.logout_outer{
		 height: 100rpx;
		 width: 100%;
		 margin-top: 100rpx;
		 
	}
</style>
