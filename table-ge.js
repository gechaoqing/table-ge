(function($, win) {
	var setTableHead = function(batchChecboxName, head) {
		var thead = $(".table-ge-thead");
		thead.html("");
		var theadTr = $("<tr/>");
		thead.append(theadTr);
		if (batchChecboxName) {
			var chb = $("<input type='checkbox' data-name='" + batchChecboxName + "' class='" + batchChecboxName + "_all'>");
			theadTr.append($("<td class='selectAll'></td>").append(chb));
		}
		for (var i in head) {
			var hi = head[i];
			theadTr.append("<td>" + head[i].title + "</td>");
		}
	};
	var bindBatchOperation = function(batchOperation, selectedData) {
		if (batchOperation !=null&& typeof batchOperation == "object") {
			var btns = batchOperation.btns;
			if (btns) {
				for (var j in btns) {
					var b = btns[j];
					$("#" + b.id).unbind("click");
					$("#" + b.id).bind("click", selectedData, b.click);
				}
			}
		}
	};
	var setTableData = function(batchOperation, head, data) {
		var batchChecboxName = null;
		if (batchOperation !=null && typeof batchOperation == "object") {
			batchChecboxName = batchOperation.checkboxName;
		}
		if (batchChecboxName) {
			var chb = $("input." + batchChecboxName + "_all[type=checkbox]");
			chb.unbind("click");
			chb.prop("checked",false);
			chb.click(function() {
				var n = $(this).attr("data-name");
				var childrens = $("input." + n + "[type=checkbox]");
				var state = $(this).prop("checked");
				childrens.prop("checked", state);
				if (data) {
					var selectedData = [];
					if (state) {
						for (var i in data) {
							delete data[i]['selected'];
						}
						selectedData = data;
					}
					bindBatchOperation(batchOperation, selectedData);
				}
			});
			bindBatchOperation(batchOperation, []);
		}
		var appendTd = function(tbodyTr, node) {
			tbodyTr.append($("<td/>").append(node));
		};
		var getHeadStyle = function(hi) {
			var style = hi.styles;
			var styleClass = hi.styleClass;
			if (typeof styleClass == "string") {
				styleClass = "class = '" + styleClass + "'";
			} else {
				styleClass = "";
			}
			if (typeof style == "string") {
				style = "style='" + style + "'";
			} else {
				style = "";
			}
			return styleClass + style;
		};


		var setCheckboxTb = function(tbodyTr, batchChecboxName, data, index) {
			var chb = $("<input type='checkbox' data-name='" + batchChecboxName + "' class='" + batchChecboxName + "'>");
			chb.click(function() {
				var n = $(this).attr("data-name");
				var all = $("input[type=checkbox]." + n + "_all");
				var state = $(this).prop("checked");
				data[index].selected = state;
				if (!state) {
					all.prop("checked", state);
				} else {
					var l = $("input." + n + "[type=checkbox]:checked").length;
					if (l == data.length) {
						all.prop("checked", state);
					}
				}
				var selectedData = [];
				for (var i in data) {
					var d = data[i];
					if (d.selected) {
						delete d['selected'];
						selectedData.push(d);
					}
				}
				bindBatchOperation(batchOperation, selectedData);
			});
			appendTd(tbodyTr, chb);
		};

		var setImageTb = function(tbodyTr, hi, data) {
			var img = $("<img " + getHeadStyle(hi) + " src='" + data[hi.value] + "'/>");
			appendTd(tbodyTr, img);
		};
		var setNormalTb = function(tbodyTr, hi, data) {
			var v = data[hi.value];
			if(typeof hi.nullValue !="undefined"){
				if(v==null||v=="null"){
					v=hi.nullValue;
				}
			}
			var span = $("<span  " + getHeadStyle(hi) + ">" + v + "</span>");
			appendTd(tbodyTr, span);
		};
		var setConvertTb = function(tbodyTr, hi, data){
			var show = hi.convert[data[hi.value]];
			if(typeof show == "undefined"){
				show=hi.convert.other;
				if(typeof show == "undefined")
				{
					show="<未知>";
				}
			}
			var span = $("<span  " + getHeadStyle(hi) + ">" +show+ "</span>");
			appendTd(tbodyTr, span);
		};

		var setOperationTb = function(tbodyTr, hi, data) {
			var btns = hi.btns;
			var td = $("<td/>").addClass("operation-td");
			if (typeof btns == "object") {
				var genBtn=function(b){
					var btn = $("<button/>").addClass("btn btn-mini btn-default");
					if (typeof b.styleClass == "string") {
						btn.addClass(b.styleClass);
					}
					btn.text(b.text);
					if (typeof b.click == "function") {
						btn.bind("click", data, b.click);
					}
					return btn;
				};
				for (var j in btns) {
					var b = btns[j];
					var shouldShow= b.shouldShow;
					if(typeof shouldShow =="object"){
						show:for(var ssi in shouldShow){
							if(shouldShow[ssi]==data[ssi]){
								td.append(genBtn(b));
								break show;
							}
						}
					}else{
						td.append(genBtn(b));
					}
				}
			}
			tbodyTr.append(td);
		};

		var tbody = $(".table-ge-tbody");
		tbody.html("");
		for (var di in data) {
			var d = data[di];
			var tbodyTr = $("<tr/>");
			tbody.append(tbodyTr);
			if (batchChecboxName) {
				setCheckboxTb(tbodyTr, batchChecboxName, data, di);
			}
			for (var i in head) {
				var hi = head[i];
				if (hi.type == "img"||hi.type==2) {
					setImageTb(tbodyTr, hi, d);
				} else if (hi.type == "operation"||hi.type==1) {
					setOperationTb(tbodyTr, hi, d);
				} else {
					if(hi.convert&& typeof hi.convert=="object"){
						setConvertTb(tbodyTr, hi, d);
					}
					else{
						setNormalTb(tbodyTr, hi, d);
					}
				}
			}
		}
	};

	var getAjaxData = function(opts) {
		var suc = opts.ajax.success;
		var err = opts.ajax.error;
		var complete = opts.ajax.complete;
		//( Anything data, String textStatus, jqXHR jqXHR )
		opts.ajax.success = function(res, status,xhr) {
			$.loadingHide();
			nextPage(res, opts);
			prePage(res, opts);
			//jump(res, opts);
			//pageInfo(res);
			setPageBtns(res,opts);
			var bop=opts.toolbar&&opts.toolbar.batchOperation;
			setTableData(bop, opts.head, res.data);
			if (typeof suc == "function") {
				suc(res, status,xhr);
			}
		};
		//( jqXHR jqXHR, String textStatus, String errorThrown )
		opts.ajax.error = function(xhr, status,error) {
			$.loadingHide();
			if (typeof err == "function") {
				err(xhr, status,error);
			}
		};
		//( jqXHR jqXHR, String textStatus )
		opts.ajax.complete = function(xhr,status) {
			if (typeof complete == "function") {
				complete(xhr, status);
			}
		};
		$.loading("正在获取数据，请稍等...");
		$.ajax(opts.ajax);
	};

	var nextPage = function(res, opts) {
		$(".next-page").unbind("click");
		$(".last-page").unbind("click");
		if (res.hasNextPage) {
			$(".next-page").prop("disabled", false).removeClass("disabled");
			$(".last-page").prop("disabled", false).removeClass("disabled");
			$(".next-page").click(function() {
				opts.ajax.data.currentPage = res.currentPage + 1;
				getAjaxData(opts);
			});
			$(".last-page").click(function(){
				opts.ajax.data.currentPage = res.totalPages;
				getAjaxData(opts);
			})
		} else {
			$(".last-page").prop("disabled", true).addClass("disabled");
			$(".next-page").prop("disabled", true).addClass("disabled");
		}
	};

	var prePage = function(res, opts) {
		$(".pre-page").unbind("click");
		$(".first-page").unbind("click");
		if (res.hasPreviousPage) {
			$(".pre-page").prop("disabled", false).removeClass("disabled");
			$(".first-page").prop("disabled",false).removeClass("disabled");
			$(".pre-page").click(function() {
				opts.ajax.data.currentPage = res.currentPage - 1;
				getAjaxData(opts);
			});
			$(".first-page").click(function(){
				opts.ajax.data.currentPage = 1;
				getAjaxData(opts);
			});
		} else {
			$(".first-page").prop("disabled",true).addClass("disabled");
			$(".pre-page").prop("disabled", true).addClass("disabled");
		}
	};

	var jump = function(res, opts) {
		$(".btn.jump-to-page").unbind("click");
		if (res.totalPages <= 1) {
			$(".btn.jump-to-page").prop("disabled", true);
			$(".jump-input").prop("disabled", true);
		} else {
			$(".btn.jump-to-page").prop("disabled", false);
			$(".jump-input").prop("disabled", false);
		}
		var to = $(".jump-input").val();
		if (to > res.totalPages) {
			to = res.totalPages;
		}
		if (to <= 0) {
			to = 1;
		}
		$(".btn.jump-to-page").click(function() {
			opts.ajax.data.currentPage = to;
			getAjaxData(opts);
		});
	};

	/*var pageInfo = function(res) {
		$(".page-info").html(res.totalRows + "," + res.currentPage + "/" + res.totalPages);
	};*/
	var setPageBtns=function(res,opts){
		var pre = $("ul.table-ge-pagination-url > .pre-page");
		var ul = $(".daymic-pages");
		ul.html("");
		for(var i=1;i<=res.totalPages;i++){
			var li = $("<li class='page-"+i+"' data-page='"+i+"'><a href='javascript:void(0)'>"+i+"</a></li>");
			if(res.currentPage==i){
				li.addClass("active");
			}
			li.click(function(){
				var th = $(this);
				if(th.hasClass("active")){
					return;
				}
				var pageNum=th.attr("data-page");
				opts.ajax.data.currentPage = pageNum;
				getAjaxData(opts);
			});
			ul.append(li);
		}
	};

	var  batchOperationLayout= function(toolbarLayout, btns) {
		var div = $("<div/>").addClass("toolbarBtns");
		for (var j in btns) {
			var b = btns[j];
			if (!b.id || b.id == "") {
				b.id = "batch_op_" + new Date().valueOf();
			}
			var btn = $("<button/>").attr("id", b.id).addClass("btn btn-default").text(b.text);
			if (b.styleClass) {
				btn.addClass(b.styleClass);
			}
			div.append(btn);
		}
		toolbarLayout.append(div);
	};
	var toolbarBtnsLayout = function(toolbarLayout,btns){
		var n = 0;
		var div = toolbarLayout.find(".toolbarBtns");
		if(div.length==0){
			div = $("<div/>").addClass("toolbarBtns");
		}
		for (var j in btns) {
			var b = btns[j];
			b.id = "toolbar_op_"+n+""+ new Date().valueOf();
			var btn = $("<button/>").attr("id", b.id).addClass("btn btn-default").text(b.text);
			if (b.styleClass) {
				btn.addClass(b.styleClass);
			}
			if(b.click)
			{
				btn.click(b.click);
			}
			div.append(btn);
			n++;
		}
		toolbarLayout.append(div);
	};

	var toolbarQueryLayout = function(toolbarLayout,opts){
		var query = opts.toolbar.query;
		var div =null;
        var btns = toolbarLayout.find(".toolbarBtns");
		var inputs = query.input;
		var selects=query.select;
        var size =inputs?inputs.length:0;
        var s = selects?selects.length:0;
        if((size+s)<=5){
            div = btns;
        }else{
            div = $("<div/>").addClass("toolbarQuery");
            if(btns.length>0){
                div.addClass("has-btns");
            }
        }
		if(inputs){
            for( var n in inputs){
                var fi=inputs[n];
                $("<input/>").addClass("query_").attr("type","text").attr("name",fi.name).attr("placeholder",fi.placeholder).appendTo(div);
            }
        }

		if(selects){
			var sel = $("<select/>").attr("name",fs.name);
			for(var n in selects){
				var fs=selects[n];
				if(typeof fs.ajax=="object"){
					var opv = fs.optionValue;
					var opn=fs.optionName;
					fs.ajax.success=function(res){
						var ops = res.obj;
						if(res.code==0){
							for(var j in ops){
								var obj=ops[j];
								var op = $("<option value='"+obj[opv]+"'>"+obj[opn]+"</option>");
								sel.append(op);
							}
						}
					};
					fs.ajax.error=function(){
						$.toast("服务器异常");
					};
					$.ajax(fs.ajax);
				}else{
					var options=fs.options;
					for(var m in options){
						var o=options[m];
						for(var mo in o){
							var op = $("<option value='"+mo+"'>"+o[mo]+"</option>");
							sel.append(op);
						}
					}
				}
			}
			div.append(sel);
		}

		var dosearch=$("<span/>").addClass("btn btn-primary").text("查询");
        dosearch.click(function(){
            div.find("input").each(function(){
                 var i = $(this);
                opts.ajax.data[i.attr("name")]= i.val();
            });
            div.find("select").each(function(){
               var s = $(this);
                opts.ajax.data[s.attr("name")]= s.val();
            });
            getAjaxData(opts);
        });
		div.append(dosearch);
		toolbarLayout.append(div);
	};

	var tableGe = win.tableGe = function(container, opts) {
		if (container!=null && typeof container != "string"&&typeof container!="object") {
			alert("请指定表格所在容器");
			return;
		}
		if(typeof container=="string")
		{container = $(container);}
		if (container.length == 0) {
			alert("指定表格所在容器" + container + "不存在！");
			return;
		}
		var toolbar = opts.toolbar;
		var batchOperation = toolbar&&toolbar.batchOperation;
		var batchChecboxName = null;
		var tableContainer = $("<div/>").addClass("table-ge-container");
		var table = $("<table/>").addClass("table-ge table table-striped table-bordered");
		var thead = $("<thead/>").addClass("table-ge-thead");
		var tbody = $("<tbody>").addClass("table-ge-tbody");
		table.append(thead).append(tbody);
		if(toolbar && typeof toolbar=="object"){
			var toolbarLayout = $("<div class='table-ge-toolbar'></div>");
			tableContainer.append(toolbarLayout);
			if (batchOperation!=null && typeof batchOperation == "object") {
				table.addClass("has-toolbar");
				batchOperationLayout(toolbarLayout, batchOperation.btns);
				batchChecboxName = batchOperation.checkboxName;
				if (!batchChecboxName || batchChecboxName == "") {
					batchChecboxName = batchOperation.checkboxName = "tableGeCheckbox";
				}
			}
			if(toolbar.btns){
				if(!table.hasClass("has-toolbar")){
					table.addClass("has-toolbar");
				}
				toolbarBtnsLayout(toolbarLayout,toolbar.btns);
			}
			if(toolbar.query){
				if(!table.hasClass("has-toolbar")){
					table.addClass("has-toolbar");
				}
				toolbarQueryLayout(toolbarLayout,opts);
			}
		}
		tableContainer.append(table);
		if (opts.pagination) {
			tableContainer.addClass("has-pagination");
			var paginationLayout = $("<div class = 'pagination pagination-small'> </div>");
			var ul = $("<ul/>").addClass("table-ge-pagination-ul");
			var first = $("<li class='first-page disabled'><a href='javascript:void(0)'>第一页</a></li>");
			var pre = $("<li class='pre-page disabled'><a href='javascript:void(0)'><</a></li>");
			var next= $("<li class='next-page disabled'><a href='javascript:void(0)'>></a></li>");
			var last = $("<li class='last-page disabled'><a href='javascript:void(0)'>最后一页</a></li>");
			var daymicLi=$("<li/>");
			var daymic=$("<ul/>").addClass("daymic-pages");
			daymicLi.append(daymic);
			paginationLayout.append(ul.append(first).append(pre).append(daymicLi).append(next).append(last));
			tableContainer.append(paginationLayout);
		}
		container.append(tableContainer);
		bindBatchOperation(batchOperation, []);
		setTableHead(batchChecboxName, opts.head);
		if (typeof opts == "object") {
			if (typeof opts.ajax == "object") {
				if(!opts.ajax.data){
					opts.ajax.data={currentPage:1};
				}
				getAjaxData(opts);
			} else {
				setTableData(batchOperation, opts.head, opts.data);
			}
		}
		$.loading("正在获取数据，请稍等...");setTimeout(function(){
			$.loadingHide();
		},2000);
		
		return {
			reload:function(){
				getAjaxData(opts);
			},
			query:function(params){
				if(opts.ajax){
					var data=opts.ajax.data;
					if(!data){
						data={currentPage:1};
					}
					for(var n in params){
						data[n]=params[n];
					}
					opts.ajax.data=data;
				}
				getAjaxData(opts);
			}
		}
	};
	$.extend({
		tableGe: tableGe
	});
	$.fn.extend({
		tableGe:function(opts){
			return tableGe(this,opts);
		}
	});
})(jQuery, window);
