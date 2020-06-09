<template>
	<view class="forget">
		
		<view class="content">
			<view class="bgColor" :style="skinMode?'':'background-color: rgba(0,0,0,0.2)'"></view>
			<!-- 主体 -->
			<view class="main">
				<view class="tips">若你忘记了密码，可在此重置新密码。</view>
				<wInput
					v-model="emailData"
					type="text"
					maxlength="30"
					placeholder="请输入邮箱账号"
				></wInput>
				<wInput
					v-model="passData"
					type="password"
					maxlength="20"
					placeholder="请输入新密码"
					isShowPass
				></wInput>
				
				<wInput
					v-model="verCode"
					type="text"
					maxlength="4"
					placeholder="验证码"
					
					isShowCode
					codeText="获取重置码"
					setTime="30"
					ref="runCode"
					@setCode="getVerCode()"
				></wInput>
			</view>
			
			<wButton 
				text="重置密码"
				:rotate="isRotate" 
				@click.native="startRePass()"
				:theme="theme_index"
			></wButton>

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
				emailData: "", //电话
				passData: "", //密码
				verCode:"", //验证码
				isRotate: false, //是否加载旋转
				isMatch: '',	//验证码是否正确
				isExist: false,	//是否存在该账号
				skinMode: true,	//夜间模式
				theme_color: ["#ED4040", "#ffcc00", "#74b886", "#395ac6", "#ffbdbd", "#424242"],
				theme_index: 0
			}
		},
		components:{
			wInput,
			wButton
		},
		mounted() {
			_this= this;
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
			//加载主题颜色
			try {
				var theme = uni.getStorageSync('theme_color');
				if (theme == '') {
					theme = 0;
				}
				this.theme_index = theme;
				uni.setNavigationBarColor({
					frontColor: "#ffffff",
					backgroundColor: this.theme_color[theme]
				})
			} catch (e) {
				// error
			}
		},
		methods: {
			sendVerCode: function(){
				return new Promise((resolve, reject) =>{
					uni.request({
						url: 'https://af1o32.toutiao15.com/send_verCode',
						data:{
							toAddress: _this.emailData,
							//content: '1234'	//验证码
						},
						method: 'POST',
						success: (res) => {
							console.log(res);
							resolve('suc');
						},
						fail: (err) => {
							reject('err');
						}
					});
				})
			},
			async getVerCode(){
				//获取验证码
				//获取验证码
				if (_this.emailData.length == 0) {
				     uni.showToast({
				        icon: 'none',
						position: 'bottom',
				        title: '邮箱账号不能为空'
				    });
				    return false;
				}
				if (!_this.emailData.match("[A-Za-z\\d]+([-_.][A-Za-z\\d]+)*@([A-Za-z\\d]+[-.])+[A-Za-z\\d]{2,4}")){
					uni.showToast({
						icon: 'none',
						position: 'bottom',
						title: '邮箱格式不正确'
					});
					return false;
				}
				console.log("获取验证码")
				await this.sendVerCode();
				this.$refs.runCode.$emit('runCode'); //触发倒计时（一般用于请求成功验证码后调用）
				uni.showToast({
				    icon: 'none',
					position: 'bottom',
				    title: '模拟倒计时触发'
				});
			},
			conVerCode: function(){
				return new Promise((resolve, reject)=>{
					uni.request({
						url: 'https://af1o32.toutiao15.com/con_verCode',
						data:{
							toAddress: _this.emailData,
							ver_code: _this.verCode
						},
						method: 'POST',
						success: (res) => {
							console.log(res);
							_this.isMatch = res.data.result;
							resolve('suc');
						},
						fail: (err) => {
							reject('err');
						}
					})
				})
			},
			ResetPass: function(){
				return new Promise((resolve, reject) =>{
					uni.request({
						url: 'https://af1o32.toutiao15.com/forget_pass',
						method: 'POST',
						data: {
							email: _this.emailData,
							password: _this.passData
						},
						success: (res) => {
							console.log(res);
							this.isExist = res.data.isExist;
							console.log(this.isExist);
							resolve('suc');
						},
						fail: (err) => {
							reject('err');
						}
					})
				})
			},
			async startRePass() {
				//重置密码
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
				if (this.passData.length < 6) {
				    uni.showToast({
				        icon: 'none',
						position: 'bottom',
				        title: '密码太短'
				    });
				    return false;
				}
				//验证码
				await this.conVerCode();
				if(_this.isMatch=='wrong'){
					uni.showToast({
						icon: 'none',
						position: 'bottom',
						title: '验证码不正确'
					});
					return false;
				}
				if(_this.isMatch=='time_out'){
					uni.showToast({
						icon: 'none',
						position: 'bottom',
						title: '超时，请重新获取验证码'
					});
					return false;
				}
				if(_this.isMatch=='no_record'){
					uni.showToast({
						icon: 'none',
						position: 'bottom',
						title: '请获取验证码'
					});
					return false;
				}
				if(_this.isMatch == 'right'){
					await this.ResetPass();
					if(_this.isExist == false){
						uni.showToast({
							icon: 'none',
							position: 'bottom',
							title: '不存在该账号'
						});
						return false;
					}
					else{
						uni.showToast({
							icon: 'none',
							position: 'bottom',
							title: '重置密码成功'
						});
						uni.redirectTo({
							url:'login'
						});
					}
				}
				_this.isRotate=true
				setTimeout(function(){
					_this.isRotate=false
				},1000)
				
				
			}
		}
	}
</script>

<style>
	@import url("../../components/watch-login/css/icon.css");
	@import url("./css/main.css");
</style>

