<template>
	<view>
		<button v-if="isLogined" @click="Logout()">退出登录</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				isLogined: true,
				user_id: '',
			}
		},
		onLoad() {
			try{
				const logined = uni.getStorageSync("isLogined");
				this.isLogined = logined;
				console.log(this.isLogined);
			}catch(e){
				//TODO handle the exception
				this.isLogined = false;
			}
		},
		methods: {
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
				}catch(e){
					
				};
				uni.redirectTo({
					url:"../config/config"
				});
			}
		}
	}
</script>

<style>

</style>
