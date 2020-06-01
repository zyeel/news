<template>
	<view class="register">
	
		<view class="content">
			<view class="bgColor" :style="skinMode?'':'background-color: rgba(0,0,0,0.2)'"></view>
			<!-- 头部logo -->
			<view class="header">
				<image :src="logoImage"></image>
			</view>
			<!-- 主体 -->
			<view class="main">
				<wInput
					v-model="emailData"
					type="text"
					maxlength="30"
					placeholder="邮箱"
				></wInput>
				<wInput
					v-model="userName"
					type="text"
					maxlength="20"
					placeholder="用户名"
				></wInput>
				<wInput
					v-model="passData"
					type="password"
					maxlength="16"
					placeholder="登录密码"
					isShowPass
				></wInput>
				<wInput
					v-model="passComfirm"
					type="password"
					maxlength="16"
					placeholder="确认密码"
					isShowPass
				></wInput>
				<wInput
					v-model="verCode"
					type="text"
					maxlength="4"
					placeholder="验证码"
					
					isShowCode
					ref="runCode"
					@setCode="getVerCode()"
				></wInput>
					
			</view>
				
			<wButton 
				text="注 册"
				:rotate="isRotate" 
				@click.native="startReg()"
			></wButton>
			
			<!-- 底部信息 -->
			<view class="footer">
				<text 
					@tap="isShowAgree" 
					class="cuIcon"
					:class="showAgree?'cuIcon-radiobox':'cuIcon-round'"
				>同意</text>
				<!-- 协议地址 -->
				<navigator url="" open-type="navigate">《协议》</navigator>
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
				logoImage:'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1588000479800&di=7d78cc58676d4ec3793a6102f41c2bd0&imgtype=0&src=http%3A%2F%2Fwww.gannancn.cn%2Fuploadfile%2F2015%2F0429%2F20150429111216420.jpg',
				emailData:'', // 用户/邮箱
				userName:'', //用户名
				passData:'', //密码
				passComfirm: '', //确认密码
				verCode:"", //验证码
				showAgree:true, //协议是否选择
				isRotate: false, //是否加载旋转
				isExist: false	,//账号是否存在
				isMatch: '',	//验证码是否正确
				skinMode: true,	//夜间模式
			}
		},
		components:{
			wInput,
			wButton,
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
		},
		methods: {
			isShowAgree(){
				//是否选择协议
				_this.showAgree = !_this.showAgree;
			},
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
				
				/*setTimeout(function(){
					_this.$refs.runCode.$emit('runCode',0); //假装模拟下需要 终止倒计时
					uni.showToast({
					    icon: 'none',
						position: 'bottom',
					    title: '模拟倒计时终止'
					});
				},3000)*/
			},
			addUsr: function(){
				return new Promise((resolve, reject) =>{
					uni.request({
						url: 'https://af1o32.toutiao15.com/usr_register',
						method: 'POST',
						data: {
							email: this.emailData,
							password: this.passData,
							username: this.userName
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
			async startReg() {
				//注册
				if(this.isRotate){
					//判断是否加载中，避免重复点击请求
					return false;
				}
				if (this.showAgree == false) {
				    uni.showToast({
				        icon: 'none',
						position: 'bottom',
				        title: '请先同意《协议》'
				    });
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
				if(this.passData != this.passComfirm){
					uni.showToast({
						icon: 'none',
						position: 'bottom',
						title: '密码不匹配'
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
				if(_this.isMatch=='right'){
					await this.addUsr();
					if(_this.isExist == true){
						uni.showToast({
							icon:'none',
							position:'bottom',
							title:"账号已存在"
						});
					}
					else{
						uni.showToast({
							icon:'none',
							position:'bottom',
							title:"注册成功"
						});
						uni.redirectTo({
							url:'login'
						});
					}
					//console.log("注册成功")
					_this.isRotate=true
					setTimeout(function(){
						_this.isRotate=false
					},3000)
				}
				
		    }
		}
	}
</script>

<style>
	@import url("../../components/watch-login/css/icon.css");
	@import url("./css/main.css");
</style>