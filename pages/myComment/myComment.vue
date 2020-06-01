<template>
	<mescroll-body ref="mescrollRef" @init="mescrollInit" :up="upOption" :down="downOption" @down="downCallback" @up="upCallback" :style="skinMode?'':'background-color: rgba(0,0,0,0.2)'">
		<view class="news-li" v-for="news in dataList">
			<comment-list @refresh="refresh" :item="news" :fontSize="fontSize" :avatar="avatar"></comment-list>
		</view>
	</mescroll-body>
</template>

<script>
	import commentList from '@/components/custom/comment-list/comment-list.vue'
	import MescrollMixin from "@/components/mescroll-uni/mescroll-mixins.js";
	import {timestampToTime} from "@/timeset.js";
	export default {
		mixins: [MescrollMixin],
		components: {
			commentList
		},
		data() {
			return {
				downOption: {
					auto: false //是否在初始化后,自动执行downCallback; 默认true
				},
				upOption: {
					auto: false
				},
				dataList: [],
				pageNum: 0,
				totalSize: 0,
				skinMode: true,
				fontSize: "normal",
				avatar: "",
			}
		},
		onLoad() {
			//加载skinMode的值
			try {
			    const value = uni.getStorageSync('skin_mode');
			    if (value!=='') {
			        this.skinMode = value
			    }
			} catch (e) {
			    // error
			}
			//加载fontSize的值
			try {
			    const value = uni.getStorageSync('font-size');
				//console.log(value);
			    if (value!=='') {
			        this.fontSize = (value==0)?'big':((value==1)?'normal':'small')
			    }
			} catch (e) {
			    // error
			}
			
			try{
				const avatar = uni.getStorageSync('avatar');
				if(avatar){
					console.log('111');
					console.log(avatar);
					this.avatar = avatar;
				}else{
					console.log('222');
					this.avatar = '../../static/logo.png';
				}
			}catch(e){
				//TODO handle the exception
			}
			
			const value = uni.getStorageSync('user_id');
			uni.request({
			    url: 'https://af1o32.toutiao15.com/getTotalSizeByUid', //仅为示例，并非真实接口地址。
			    data: {
			        user_id: value,
			    },
			    method:'POST',
			    success: (res) => {
					this.totalSize = res.data.result
			    }
			});
		},
		methods: {
			//用于子组件删除评论后刷新页面
			refresh(comment_id){
				var temp =[];
				var index = 0;
				for(var i =0;i<this.totalSize;i++){
					console.log(comment_id,this.dataList[i].comment_id)
					if(comment_id!==this.dataList[i].comment_id){
						temp[index] = this.dataList[i];
						index++;
					}
				}
				this.totalSize--;
				this.dataList = temp;
			},
			mescrollInit(){
				const value = uni.getStorageSync('user_id');
				if (value!=='') {
				    uni.request({
				        url: 'https://af1o32.toutiao15.com/getCommentByUid', //仅为示例，并非真实接口地址。
				        data: {
				            user_id: value,
							count: 8,
							pageNum: this.pageNum
				        },
				        method:'POST',
				        success: (res) => {	
							for ( var i = 0 ; i < 8 ; i = i+1 )
							{
								//console.log("3"+i)
								this.setDataList(res.data.result[i])
							}
				        }
				    });
				}
			},
			/*下拉刷新的回调 */
			downCallback() {
				const value = uni.getStorageSync('user_id');
				if (value!=='') {
					this.pageNum = this.pageNum +1;
				    uni.request({
				        url: 'https://af1o32.toutiao15.com/getCommentByUid', //仅为示例，并非真实接口地址。
				        data: {
				            user_id: value,
							count: 8,
							pageNum: this.pageNum
				        },
				        method:'POST',
				        success: (res) => {
							this.mescroll.endSuccess();
							for ( var i = 0 ; i < 8 ; i = i+1 )
							{
								//console.log("2"+i)
								this.setDataList(res.data.result[i])
							}
				        }
				    });
				}
			},
			/*上拉加载的回调: 其中page.num:当前页 从1开始, page.size:每页数据条数,默认10 */
			upCallback() {
				const value = uni.getStorageSync('user_id');
				if(this.pageNum*8+8<this.totalSize){
					//console.log(this.pageNum*8-8,this.totalSize)
					this.mescroll.endSuccess()
				}else{
					this.mescroll.endBySize(8,this.totalSize);
				}
				
				if (value!=='') {
					this.pageNum = this.pageNum + 1;
				    uni.request({
				        url: 'https://af1o32.toutiao15.com/getCommentByUid', //仅为示例，并非真实接口地址。
				        data: {
				            user_id: value,
							count: 8,
							pageNum: this.pageNum
				        },
				        method:'POST',
				        success: (res) => {			
							for ( var i = 0 ; i < 8 ; i = i+1 )
							{
								//console.log(i)
								this.setDataList(res.data.result[i])
							}
				        }
				    });
					
					
				}
			},
			setDataList(item){
				if(!item) return;//可能评论数不足8条，此时直接返回
				const username = uni.getStorageSync('username');
				uni.request({
				    url: 'https://af1o32.toutiao15.com/get_news_info', //仅为示例，并非真实接口地址。
				    data: {
				        news_id: item.news_id
				    },
				    method:'POST',
				    success: (res2) => {
						//console.log(item)
						this.dataList.unshift({
							comment_timestamp: timestampToTime(item.comment_timestamp),
							content: item.content,
							username: username, 
							news_name: res2.data.news_name,
							news_id: item.news_id,
							comment_id: item._id
						});
						//console.log(item)
				    }
				});
			}
		}
	}
</script>

<style>
</style>
