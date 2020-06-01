<template>
	<view>
		<!--选择时间范围-->
		<view class="item-all">
			<view class="item-left">
				选择范围：
			</view>
			<view class="item-right">
				<picker @change="bindPickerChange" :value="index" :range="array">
					<view class="choose">{{array[index]}}</view>
				</picker>
			</view>
		</view>
		<!--单项-->
		<view class="item-all">
			<view class="item-left">
				最关注的频道：
			</view>
			<view class="item-right">
				<view class="data-show">{{most_tab}}</view>
			</view>
		</view>
		<view class="item-all">
			<view class="item-left">
				发表的评论数量：
			</view>
			<view class="item-right">
				<view class="data-show">{{comment_num}}</view>
			</view>
		</view>
		<view class="item-all">
			<view class="item-left">
				新闻点赞数量：
			</view>
			<view class="item-right">
				<view class="data-show">{{digg_news_num}}</view>
			</view>
		</view>
		<view class="item-all">
			<view class="item-left">
				新闻收藏数量：
			</view>
			<view class="item-right">
				<view class="data-show">{{collect_num}}</view>
			</view>
		</view>
		<!--饼图-->
		<view class="qiun-columns">
			<view class="qiun-bg-white qiun-title-bar qiun-common-mt" >
				<view class="qiun-title-dot-light">各板块新闻阅读百分比</view>
			</view>
			<view class="qiun-charts" >
				<canvas canvas-id="canvasPie" id="canvasPie" class="charts" @touchstart="touchPie"></canvas>
			</view>
		</view>
		<!--柱状图-->
		<view class="qiun-columns">
			<view class="qiun-bg-white qiun-title-bar qiun-common-mt" >
				<view class="qiun-title-dot-light">各板块新闻阅读数量</view>
			</view>
			<view class="qiun-charts" >
				<canvas canvas-id="canvasColumn" id="canvasColumn" class="charts" @touchstart="touchColumn"></canvas>
			</view>
		</view>
		<!--词云图-->
		<view class="qiun-columns">
			<view class="qiun-bg-white qiun-title-bar qiun-common-mt" >
				<view class="qiun-title-dot-light" >标题词汇</view>
			</view>
			<view class="qiun-charts" >
				<canvas canvas-id="canvasWordTitle" id="canvasWordTitle" class="charts"></canvas>
			</view>
		</view>
		<!--词云图-->
		<view class="qiun-columns">
			<view class="qiun-bg-white qiun-title-bar qiun-common-mt" >
				<view class="qiun-title-dot-light" >评论词汇</view>
			</view>
			<view class="qiun-charts" >
				<canvas canvas-id="canvasWordComment" id="canvasWordComment" class="charts"></canvas>
			</view>
		</view>
	</view>
	
</template>

<script>
	import uCharts from '../../components/u-charts/u-charts/u-charts.js';
	var _self;
	var canvaPie=null;
	var canvaColumn=null;
	var canvaWord=null;
	export default {
		data() {
			return {
				cWidth:'',
				cHeight:'',
				pixelRatio:1,
				serverData:'',
				array: ['今日', '一周内', '一个月内', '一年内'],
				index: 0,
				most_tab: '',
				comment_num: 0,
				digg_news_num: 0,
				collect_num:0,
				user_id: '',
				theme_color: ["#ED4040","#ffcc00","#74b886","#395ac6","#ffbdbd","#424242"]
			}
		},
		onLoad(e) {
			_self = this;
			this.cWidth=uni.upx2px(750);
			this.cHeight=uni.upx2px(500);
			const user_id = uni.getStorageSync('user_id');
			this.user_id=user_id;
			console.log(this.user_id);
			this.getServerData();
			
			//加载主题颜色
			try {
				var theme = uni.getStorageSync('theme_color');
				if (theme == '') {
					theme = 0;
				}
				uni.setNavigationBarColor({
					frontColor: "#ffffff",
					backgroundColor: this.theme_color[theme]
				})
			} catch (e) {
				// error
			}
		},
		
		methods: {
			bindPickerChange: function(e) {
			            console.log('picker发送选择改变，携带值为', e.target.value)
			            this.index = e.target.value
						this.getServerData();
			},
			//获取数据
			getServerData(){
				uni.request({
					url: 'https://af1o32.toutiao15.com/get_use_report?user_id='+this.user_id+'&time='+this.array[this.index],
					data:{
					},
					success: function(res) {
						console.log(res)
						let Pie= res.data.Pie_News;
						_self.showPie("canvasPie",Pie);
						let Column=res.data.Column_News;
						_self.showColumn("canvasColumn",Column);
						let Word_Title=res.data.Word_Title;
						_self.showWord("canvasWordTitle",Word_Title);
						let Word_Comment=res.data.Word_Comment;
						_self.showWord("canvasWordComment",Word_Comment);
						_self.most_tab = res.data.Most_Tab;					
						_self.comment_num = res.data.Comment_Num;
						_self.digg_news_num = res.data.Digg_Num;
						_self.collect_num = res.data.Collect_Num;
						},
					fail: () => {
							_self.tips="网络错误，小程序端请检查合法域名";
						},
					});
			},
			//饼图
			showPie(canvasId,chartData){
				canvaPie=new uCharts({
					$this:_self,
					canvasId: canvasId,
					type: 'pie',
					fontSize:11,
					legend:{show:true},
					background:'#FFFFFF',
					pixelRatio:_self.pixelRatio,
					series: chartData.series,
					animation: true,
					width: _self.cWidth*_self.pixelRatio,
					height: _self.cHeight*_self.pixelRatio,
					dataLabel: true,
					extra: {
						pie: {
						  lableWidth:15
						}
					},
				});
			},
			touchPie(e){
				canvaPie.showToolTip(e, {
					format: function (item) {
						return item.name + ':' + item.data 
					}
				});
			},
			//柱状图
			
			showColumn(canvasId,chartData){
				canvaColumn=new uCharts({
					$this:_self,
					canvasId: canvasId,
					type: 'column',
					legend:{show:true},
					fontSize:8,
					background:'#FFFFFF',
					pixelRatio:_self.pixelRatio*1.5,
					animation: true,
					categories: chartData.categories,
					series: chartData.series,
					xAxis: {
						disableGrid:true,
					},
					yAxis: {
						//disabled:true
					},
					dataLabel: true,
					width: _self.cWidth*_self.pixelRatio,
					height: _self.cHeight*_self.pixelRatio,
					extra: {
						column: {
							type:'group',
							width: _self.cWidth*_self.pixelRatio*0.45/chartData.categories.length
						}
					  }
				});
				
			},
			touchColumn(e){
				canvaColumn.showToolTip(e, {
					format: function (item, category) {
						if(typeof item.data === 'object'){
							return category + ' ' + item.name + ':' + item.data.value 
						}else{
							return category + ' ' + item.name + ':' + item.data 
						}
					}
				});
			},
			//词云
			showWord(canvasId,chartData){
				canvaWord=new uCharts({
					$this:_self,
					canvasId: canvasId,
					type: 'word',
					background:'#FFFFFF',
					pixelRatio:_self.pixelRatio,
					animation:true,
					series: chartData.series,
					width: _self.cWidth*_self.pixelRatio,
					height: _self.cHeight*_self.pixelRatio,
					extra: {
						word: {
						  type: 'normal'
						}
					}
				});
			},
		}
	}
</script>

<style>
page{background:#F2F2F2;width: 750upx;overflow-x: hidden;}
.qiun-padding{padding:2%; width:96%;}
.qiun-wrap{display:flex; flex-wrap:wrap;}
.qiun-rows{display:flex; flex-direction:row !important;}
.qiun-columns{display:flex; flex-direction:column !important; margin-bottom:20upx;}
.qiun-common-mt{margin-top:20upx;}
.qiun-bg-white{background:#FFFFFF;}
.qiun-title-bar{width:96%; padding:10upx 2%; flex-wrap:nowrap;}
.qiun-title-dot-light{border-left: 10upx solid #0ea391; padding-left: 10upx; font-size: 32upx;color: #000000; margin-bottom: 20upx;}
.qiun-charts{width: 750upx; height:500upx;background-color: #FFFFFF;}
.charts{width: 750upx; height:500upx;background-color: #FFFFFF;}

.item-all{ width: 750upx; height: 80upx; margin-top: 20upx; margin-bottom: 20upx;background-color: white; display: flex; font-size: 30upx; }
.item-left{margin-left: 20upx; line-height: 80upx;}
.item-right{ margin-left: 50upx; width:200upx; line-height: 80upx; }
.choose{ color: #0A98D5; line-height: 80upx;}
.data-show{ color: #4A79CF; line-height: 80upx;}
</style>
