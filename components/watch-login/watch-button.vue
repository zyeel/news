<template>
	<view>
		<!-- 按钮 -->
		<button :class="['buttonBorder',!_rotate?'dlbutton':'dlbutton_loading']" :style="{'background':bgColor, 'color': fontColor}">
			<view :class="_rotate?'rotate_loop':''">
				<text v-if="_rotate" class="cuIcon cuIcon-loading1 "></text>
				<text v-if="!_rotate">{{ text }}</text>
			</view>
		</button>
	</view>
</template>

<script>
	export default{
		props:{
			text: String, //显示文本
			theme : Number,
			rotate:{
				//是否启动加载
				type: [Boolean,String],
				default: false,
			}, 
			bgColor0:{
				//按钮背景颜色
				type: String,
				default: "linear-gradient(to right, rgba(237,64,64,0.9), rgba(237,64,64,0.7))",
			},
			bgColor1:{
				//按钮背景颜色
				type: String,
				default: "linear-gradient(to right, rgba(255,204,0,0.9), rgba(255,204,0,0.7))",
			},
			bgColor2:{
				//按钮背景颜色
				type: String,
				default: "linear-gradient(to right, rgba(116,184,134,0.9), rgba(116,184,134,0.7))",
			},
			bgColor3:{
				//按钮背景颜色
				type: String,
				default: "linear-gradient(to right, rgba(57,90,198,0.9), rgba(57,90,198,0.7))",
			},
			bgColor4:{
				//按钮背景颜色
				type: String,
				default: "linear-gradient(to right, rgba(255,189,189,0.9), rgba(255,189,189,0.7))",
			},
			bgColor5:{
				//按钮背景颜色
				type: String,
				default: "linear-gradient(to right, rgba(66,66,66,0.9), rgba(66,66,66,0.7))",
			},
			fontColor:{
				//按钮字体颜色
				type: String,
				default: "#FFFFFF",
			},
		},
		computed:{
			_rotate() {
				//处理值
				return String(this.rotate) !== 'false'
			},
			bgColor(){
				return this.$props['bgColor'+this.theme];
			}
		}
	}
</script>

<style>
	@import url("./css/icon.css");
	
	.dlbutton {
		display: flex;
		justify-content: center;
		align-items: center;
		color: #FFFFFF;
		font-size: 30upx;
		width:601upx;
		height:100upx;
		background:linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.6));
		box-shadow:0upx 0upx 13upx 0upx rgba(164,217,228,0.4);
		border-radius:2.5rem;
		margin-top: 0upx;
	}
	.dlbutton_loading {
		display: flex;
		justify-content: center;
		align-items: center;
		color: #FFFFFF;
		font-size: 30upx;
		width:100upx;
		height:100upx;
		background:linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.6));
		box-shadow:0upx 0upx 13upx 0upx rgba(164,217,228,0.4);
		border-radius:2.5rem;
		margin-top: 0upx;
	}
	.buttonBorder{
	    border: none ;
	    border-radius: 2.5rem ;
	    -webkit-box-shadow: 0 0 60upx 0 rgba(0,0,0,.2) ;
	    box-shadow: 0 0 60upx 0 rgba(0,0,0,.2) ;
	    -webkit-transition: all 0.4s cubic-bezier(.57,.19,.51,.95);
	    -moz-transition: all 0.4s cubic-bezier(.57,.19,.51,.95);
	    -ms-transition: all 0.4s cubic-bezier(.57,.19,.51,.95);
	    -o-transition: all 0.4s cubic-bezier(.57,.19,.51,.95);
	    transition: all 0.4s cubic-bezier(.57,.19,.51,.95);
	}
	
	/* 旋转动画 */
	.rotate_loop{
		-webkit-transition-property: -webkit-transform;
	    -webkit-transition-duration: 1s;
	    -moz-transition-property: -moz-transform;
	    -moz-transition-duration: 1s;
	    -webkit-animation: rotate 1s linear infinite;
	    -moz-animation: rotate 1s linear infinite;
	    -o-animation: rotate 1s linear infinite;
	    animation: rotate 1s linear infinite;
	}
	@-webkit-keyframes rotate{from{-webkit-transform: rotate(0deg)}
	    to{-webkit-transform: rotate(360deg)}
	}
	@-moz-keyframes rotate{from{-moz-transform: rotate(0deg)}
	    to{-moz-transform: rotate(359deg)}
	}
	@-o-keyframes rotate{from{-o-transform: rotate(0deg)}
	    to{-o-transform: rotate(359deg)}
	}
	@keyframes rotate{from{transform: rotate(0deg)}
	    to{transform: rotate(359deg)}
	}
</style>
