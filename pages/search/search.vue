<template>
	<view>
		<template v-if="searchList.length===0">
			<view class="mx-2 py-2 font-md">搜索历史</view>
			<view class="flex flex-wrap">
				<view class="border rounded font mx-2 my-1 px-2" 
				@click="" hover-class="bg-light" v-for="(item,index) in list" :key="index">{{item}}</view>
			</view>
		</template>
		<template v-else></template>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				searchList:[],
				searchText:"",
				list:['塞尔维亚简介','工资扣税标准公式','社保补贴的办理方法','广东省开学时间']
			}
		},
		onNavigationBarSearchInputChanged(e){
			this.searchText=e.text;
		},
		onNavigationBarButtonTap(e){
			if(e.index===0){
				this.searchEvent();
			}
		},
		methods: {
			searchEvent(){
				uni.hideKeyboard();
				uni.showLoading({
					title:"加载中...",
					mask:false
				})
				//请求搜索
			}
		}
	}
</script>

<style>

</style>