<template>
	<view>
		<uni-nav-bar :border="false" :fixed="true" :statusBar="true">
			<view class="flex align-center justify-center font-weight-bold w-100">
				<view class="font-lg text-main mx-1">关注</view>
				<view class="font-md text-light-muted mx-1">话题</view>
			</view>
			<text slot="right" class="iconfont icon-fatie_icon"></text>
		</uni-nav-bar>
	</view>
</template>

<script>
	import uniNavBar from '@/components/uni-nav-bar/uni-nav-bar.vue'
	export default {
		components:{
			uniNavBar
		},
		data() {
			return {
				
			}
		},
		methods: {
			
		}
	}
</script>

<style>

</style>
