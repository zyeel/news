<template>
	<view class="login">
		<view class="content">
			<view class="bgColor" :style="skinMode?'':'background-color: rgba(0,0,0,0.2)'"></view>
			<!-- 头部logo -->
			<view class="header">
				<image :src="logoImage"></image>
			</view>
			<!-- 主体表单 -->
			<view class="main">
				<wInput
					v-model="emailData"
					type="text"
					maxlength="30"
					placeholder="用户名"
				></wInput>
				<wInput
					v-model="passData"
					type="password"
					maxlength="16"
					placeholder="密码"
				></wInput>
			</view>
			<wButton 
				text="登 录"
				:rotate="isRotate" 
				@click.native="startLogin()"
				class="wbutton"
			></wButton>
			
			<!-- 其他登录 
			<view class="other_login cuIcon">
				<view class="login_icon">
					<view class="cuIcon-weixin" @tap="login_weixin"></view>
				</view>
				<view class="login_icon">
					<view class="cuIcon-weibo" @tap="login_weibo"></view>
				</view>
			</view>
			-->
			<!-- 底部信息 -->
			<view class="footer">
				<navigator url="forget" open-type="redirect">找回密码</navigator>
				<text>|</text>
				<navigator url="register" open-type="redirect">注册账号</navigator>
			</view>
		</view>
	</view>
</template>

<script>
	var _this;
	import wInput from '../../components/watch-login/watch-input.vue' //input
	import wButton from '../../components/watch-login/watch-button.vue' //button
	
	export default {
		data() {
			return {
				//logo图片 base64
				username:'',	//用户名
				user_id : '', //用户id
				avatar : '', //用户头像
				logoImage:'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1588000479800&di=7d78cc58676d4ec3793a6102f41c2bd0&imgtype=0&src=http%3A%2F%2Fwww.gannancn.cn%2Fuploadfile%2F2015%2F0429%2F20150429111216420.jpg',
				emailData:'', //用户邮箱
				passData:'', //密码
				signature: '',	//个性签名
				isRotate: false, //是否加载旋转
				isMatch: false,	//密码是否正确
				isExist: false,	//账号是否存在
				isLogin: false,	//账号是否在别的设备上被登录
				skinMode: true,	//夜间模式
			};
		},
		components:{
			wInput,
			wButton,
		},
		mounted() {
			_this= this;
			//this.isLogin();
		},
		onLoad() {
			try{
				const skin = uni.getStorageSync("skin_mode");
				if(skin!==''){
					this.skinMode = skin;
				}
				console.log(this.skinMode);
			}catch(e){
				//TODO handle the exception
				//_this.skinMode = true;
			}
		},
		methods: {
			getLoginInfo: function(){
				return new Promise((resolve, reject)=>{
					uni.request({
						url: 'https://af1o32.toutiao15.com/usr_login',
						method: 'POST',
						data: {
							email: _this.emailData,
							password: _this.passData
						},
						success: res => {
							//console.log('res',res);
							//console.log(res.data.pwMatchFlag);
							_this.isMatch = res.data.pwMatchFlag;
							_this.isExist = res.data.isExist;
							_this.username = res.data.username;
							_this.user_id = res.data.user_id;
							_this.avatar = res.data.avatar;
							_this.isLogin = res.data.isLogined;
							_this.signature = res.data.signature;
							//console.log(_this.isMatch);
							resolve('suc');
						},
						fail: (err) => {
							reject('err');
						}
					});
				})
			},
		    async startLogin(){
				//登录
				if(this.isRotate){
					//判断是否加载中，避免重复点击请求
					return false;
				}
				if (!this.emailData.match("[A-Za-z\\d]+([-_.][A-Za-z\\d]+)*@([A-Za-z\\d]+[-.])+[A-Za-z\\d]{2,4}")) {
				    uni.showToast({
				        icon: 'none',
						position: 'bottom',
				        title: '邮箱格式不正确'
				    });
				    return false;
				}
				if (this.emailData.length == 0) {
				     uni.showToast({
				        icon: 'none',
						position: 'bottom',
				        title: '用户名不能为空'
				    });
				    return;
				}
		        
				await _this.getLoginInfo();
				
				//console.log("登录成功")
				//console.log('222');
				_this.isRotate=true
				setTimeout(function(){
					_this.isRotate=false
				},1000)
				uni.showLoading({
				 	title: '登录中'
				});
				if(_this.isLogin==true){
					uni.showToast({
						icon: 'none',
						position: 'bottom',
						title: '账号已在别的设备上登录，登录失败'
					 })
				}
				else if(_this.isExist==false){
					uni.showToast({
						icon: 'none',
						position: 'bottom',
						title: '账号不存在'
					 })
				}
				else{
					if(_this.isMatch==true){
						uni.showToast({
							icon: 'none',
							position: 'bottom',
							title: '登录成功'
						 });
						 try{
							uni.setStorageSync('username',_this.username);
							uni.setStorageSync('user_id',_this.user_id);
							uni.setStorageSync('signature', _this.signature);
							console.log(_this.signature);
							uni.setStorageSync('isLogined', true);
						 }catch(e){ 
						 };
						 if(_this.avatar==''||_this.avatar==undefined){
							try{
								uni.setStorageSync('avatar','../../static/logo.png');
							}catch(e){ 
							}; 
						 }else{
							try{
								uni.setStorageSync('avatar',_this.avatar);
							}catch(e){ 
							}; 
						 }
						 /*
						 uni.switchTab({
						 	url:'../mine/mine'
						 });
						 */
						uni.navigateBack();
					}
					else{
						try{
							uni.setStorageSync('isLogined', false);
						}catch(e){
						};
						uni.showToast({
							icon: 'none',
							position: 'bottom',
							title: '登录失败'
						});
					}
				}
		    },
			login_weixin() {
				//微信登录
				uni.showToast({
					icon: 'none',
					position: 'bottom',
					title: '...'
				});
			},
			login_weibo() {
				//微博登录
				uni.showToast({
					icon: 'none',
					position: 'bottom',
					title: '...'
				});
			},
			login_github() {
				//github登录
				uni.showToast({
					icon: 'none',
					position: 'bottom',
					title: '...'
				});
			}
		}
	}
</script>

<style>
	@import url("../../components/watch-login/css/icon.css");
	@import url("./css/main.css");
</style>
