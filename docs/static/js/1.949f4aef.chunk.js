(window.webpackJsonp=window.webpackJsonp||[]).push([[1],{104:function(t,e,a){"use strict";a.r(e);var n=a(44),r=a(7),i=a(8),o=a(11),l=a(9),s=a(10),c=a(1),u=a.n(c),d=a(13),h=a(99),p=function(t){for(;t<0;)t+=86400;for(;t>=86400;)t-=86400;var e=parseInt(t+.5),a=parseInt(e%60),n=parseInt(e/60)%60,r=parseInt(parseInt(e/60)/60),i=function(t){return"".concat(("00"+t).slice(-2))};return 0!==a?"".concat(i(r),":").concat(i(n),":").concat(i(a)):"".concat(i(r),":").concat(i(n))},f=function(t){var e={update:function(){this.x=t.x,this.y=t.y,this.text=p(t.x),this.dx=6,this.dy=5,this.fontSize=.7}};return e.update(),e},m=function(t){var e=t.busStops,a=t.timeLines,n=e.split("\n").map(function(t){return"-"===t?"":t}),r=a.split("\n"),i=[],o=[];if(r.forEach(function(t){var e=t.split(" "),a=[],n=0,r=null;e.forEach(function(t,e){"-"!==t&&""!==t&&t.split("-").forEach(function(t){var e=function(t,e){var a=t.trim().split(":"),n=0,r=0,i=0;a.length>0&&(n=parseInt(a[0])),a.length>1&&(r=parseInt(a[1])),a.length>2&&(i=parseInt(a[2]));var o,l=60*n*60+60*r+i,s=l;if(null!==e){var c=e%86400-l%86400;((o=c)>0?o:-o)>=43200&&(s+=86400*function(t){return t>0?1:-1}(c))}return{t:s,x:l}}(t,r),o=e.t,l=e.x,s={x:o,y:n+1};s.time=f(s),i.push(s),a.push(s),r=l});n++});var l=null;a.forEach(function(t){l&&o.push({s:l,d:t}),l=t})}),n.length<2)for(;n.length<2;)n.push("");return{busStops:n.map(function(t){return{name:t}}),pointData:i,lineData:o}},y=function(t){var e=t.busStops,a=t.pointData,n=t.lineData,r=e.map(function(t){return t.name.trim().replace(/\s/g,"")}),i=(a.sort(function(t,e){return t.x>e.x?1:t.x<e.x?-1:0}).map(function(t,e){return t.index=e,t.lines=[],t}),n.map(function(t){if(t.s.x>t.d.x){var e=t.s;t.s=t.d,t.d=e}return t.done=!1,t.s.lines.push(t),t.d.lines.push(t),t}).sort(function(t,e){return t.s.x>e.s.x?1:t.s.x<e.s.x?-1:0})),o=0;i.forEach(function(t,e){!function t(e,a){e.done||(e.done=!0,a<0&&(a=o,o++),e.index=a,e.s.lines.forEach(function(e){t(e,a)}),e.d.lines.forEach(function(e){t(e,a)}))}(t,-1)});var l=[];i.sort(function(t,e){return t.index>e.index?1:t.index<e.index?-1:0}).forEach(function(t){"undefined"==typeof l[t.index]&&(l[t.index]=[]),l[t.index].push(t)});var s=[];return l.forEach(function(t){var e=t.sort(function(t,e){return t.s.y>e.s.y?1:t.s.y<e.s.y?-1:0}),a=!1;e[0].s.y<e[0].d.y&&(a=!0);var n=[],i=null;e.forEach(function(t,e){a?n.push(t.s):n.push(t.d),i=t}),i&&(a?n.push(i.d):n.push(i.s));var o=[];r.forEach(function(t){o.push([])}),n.forEach(function(t){o[t.y-1].push(t)}),s.push(o.map(function(t){if(0===t.length)return"-";var e="";return t.forEach(function(t){""!==e&&(e+="-"),e+=p(t.x)}),e}).join(" "))}),{busStops:r.map(function(t){return""===t?"-":t}).join("\n"),timeLines:s}},g=function(t,e){var a=t.busStops,n=t.pointData;t.lineData;a.splice(e,0,{name:""}),n.forEach(function(t){t.y>=e+1&&(t.y+=1)})},x=function(t,e){var a=t.busStops,n=t.pointData,r=t.lineData;if(console.log(a[e].name),""===a[e].name){a.splice(e,1);var i=[];n.forEach(function(t,a){t.y==e+1?(t.delete=!0,i.push(a)):t.y>e+1&&(t.y-=1)}),i.reverse().forEach(function(t){n.splice(t,1)});var o=[];r.forEach(function(t,e){(t.s.delete||t.d.delete)&&o.push(e)}),o.reverse().forEach(function(t){r.splice(t,1)})}},v=150,D=86400,b=function(t){return t<0&&(t+=D),t%D},S=function(t){return t<0?60*parseInt((t-60+30)/60):60*parseInt((t+30)/60)},E=function(t){return"".concat(t.busStops.split("\n").join(" "),"\n").concat(t.timeLines.join("\n"),"\n")},k=function(t){var e=t.split("\n"),a=null,n=null;return e.some(function(t,e){return 0!=t.indexOf("/")&&(null===a?(a=t,!1):(null===n&&(n=e),!0))}),{busStops:null!==a?a.split(" ").join("\n"):"",timeLines:null!==n?e.slice(n).join("\n"):""}},w=function(t){function e(t){var a;Object(r.a)(this,e),(a=Object(o.a)(this,Object(l.a)(e).call(this,t))).size=function(){return{width:a.state.width,height:a.state.height}},a.loadData=function(t){var e=m(k(t)),n=e.busStops,r=e.lineData,i=e.pointData;a.lineData=r,a.pointData=i,a.busStops=n,a.lineLoopData=[],a.pointLoopData=[],a.textData=[],a.componentDidUpdate()},a.timeLineWidth=function(){return 3600/a.gridScale.x},a.busLineHeight=function(){return 1/a.gridScale.y},a.makeLine=function(t,e){a.lineData.push({s:t,d:e}),a.deleteDoubleLine()},a.selectPoint=function(t){t.selected=!0},a.deselectPoint=function(t){delete t.selected,delete t.lastSelect},a.deleteDoubleLine=function(){var t={},e=[];a.pointData.forEach(function(t,e){t.index=e}),a.lineData.forEach(function(a){var n="".concat(a.d.index,"-").concat(a.s.index);a.s.index<a.d.index&&(n="".concat(a.s.index,"-").concat(a.d.index)),"undefined"===typeof t[n]&&(e.push(a),t[n]=a)}),a.lineData=e},a.initialize=function(){var t=a.size(),e=t.width,n=t.height;a.xScale=h.d().domain([0,e*a.timeLineWidth()]).range([0,e]),a.yScale=h.d().domain([a.gridScale.dy,n*a.busLineHeight()+a.gridScale.dy]).range([0,n]),a.dragHandle=h.a().on("start",function(t,e){if(!a.props.readOnly){var n=t.org;a.cursorData.visible=!1,a.drawCursor();var r=null,i=0;if(a.pointData.some(function(t,e){return!(!t.selected||!t.lastSelect)&&(r=t,i=e,!0)}),a.altKey=h.b.sourceEvent.altKey,h.b.sourceEvent.altKey&&null!==r&&i!==e){var o=E(y(Object(d.a)(Object(d.a)(a)))),l=a.pointData.length,s=a.lineData.length;a.pointData.forEach(function(t){delete t.lastSelect}),n.lastSelect=!0,a.selectPoint(n);h.b.on("end",function(t,e){var n=t.org;a.makeLine(r,n),a.onChange(),a.updateData(),a.update(),a.pointData.length==l&&a.lineData.length==s||a.setUndo(o)})}else{var c=E(y(Object(d.a)(Object(d.a)(a)))),u=!1,p=!1;n.selected||(p=!0),a.pointData.forEach(function(t){delete t.lastSelect}),n.lastSelect=!0,a.selectPoint(n),a.pointData.forEach(function(t){t.selected&&(t.ox=a.xScale(t.x),t.oy=a.yScale(t.y))});h.b.on("drag",function(t){var e=t.org;u=!0,!h.b.sourceEvent.shiftKey&&p&&(a.pointData.forEach(function(t){a.deselectPoint(t)}),a.lineData.forEach(function(t){delete t.selected}),a.selectPoint(e)),a.pointData.forEach(function(t){t.selected&&(t.ox+=h.b.dx,t.oy+=h.b.dy,t.x=S(a.xScale.invert(t.ox)))}),a.update()}).on("end",function(t,e){var n=t.org;u?a.setUndo(c):!h.b.sourceEvent.shiftKey&&p&&(a.pointData.forEach(function(t){a.deselectPoint(t)}),a.lineData.forEach(function(t){delete t.selected}),a.selectPoint(n),n.lastSelect=!0),a.pointData.forEach(function(t){delete t.ox,delete t.oy}),a.onChange(),a.update()})}}}),a.dragMarky=h.a().on("start",function(t,e){if(a.cursorData.visible=!1,a.drawCursor(),a.altKey=h.b.sourceEvent.altKey,h.b.sourceEvent.altKey&&!a.props.readOnly){var n=E(y(Object(d.a)(Object(d.a)(a)))),r=null;a.pointData.some(function(t,e){return!(!t.selected||!t.lastSelect)&&(r=t,e,!0)}),a.pointData.forEach(function(t){delete t.lastSelect});var i={x:a.cursorData.x,y:a.cursorData.y,selected:!0,lastSelect:!0};a.selectPoint(i),a.pointData.push(i),r&&a.makeLine(r,i),a.onChange(),a.updateData(),a.update(),a.cursorData.visible=!1,a.drawCursor(),a.setUndo(n)}if(h.b.sourceEvent.shiftKey){a.marky,h.e(a.bar);var o=!1,l=h.b.x,s=h.b.y;a.markyData.x=l,a.markyData.y=s,a.markyData.width=0,a.markyData.height=0;h.b.on("drag",function(t){o||(l=h.b.x,s=h.b.y,a.markyData.x=l,a.markyData.y=s,a.markyData.width=0,a.markyData.height=0,o=!0),l+=h.b.dx,s+=h.b.dy,a.markyData.width=l-a.markyData.x,a.markyData.height=s-a.markyData.y,a.markyData.visible=!0,a.updateMarky()}).on("end",function(){a.markyData.visible=!1,a.updateMarky();var t,e=a.markyData.x,n=a.markyData.y,r=a.markyData.x+a.markyData.width,i=a.markyData.y+a.markyData.height;t=e,r<e&&(e=r,r=t),t=n,i<n&&(n=i,i=t);var o=function(t){return[a.xScale.invert(t[0]),a.yScale.invert(t[1])]},l=o([e,n]),s=o([r,i]);a.pointLoopData.forEach(function(t){if(h.b.sourceEvent.shiftKey&&t.org.selected)return!0;l[0]<=t.x&&t.x<=s[0]&&l[1]<=t.y&&t.y<=s[1]?a.selectPoint(t.org):a.deselectPoint(t.org)});var c=0,u=null;a.pointData.forEach(function(t){t.selected&&(c++,u=t)}),1===c&&(u.lastSelect=!0),a.update()})}});var r=0,i=null;if(a.gridZoomBehavior=h.f().scaleExtent([.8,160]).filter(function(){return a.altKey=h.b.altKey,!h.b.shiftKey&&!h.b.altKey}).on("start",function(){r=0,i=h.b.transform.k}).on("zoom",function(){r++,i!==h.b.transform.k&&(r+=10);var t=h.b.transform;a.props.onChangeParam&&(a.params.gridZoom=t,a.props.onChangeParam(a.params)),a.xScale.range([t.applyX(0),t.applyX(a.state.width)]),a.clearGrid(a.grid),a.updateData(),a.update(),a.cursorData.visible=!1,a.drawCursor()}).on("end",function(){r<5&&(a.pointData.forEach(function(t){a.deselectPoint(t)}),a.lineData.forEach(function(t){delete t.selected,delete t.lastSelect}),a.update())}),a.base.call(a.gridZoomBehavior).on("dblclick.zoom",null).call(a.dragMarky).on("mouseleave",function(){a.cursorData.visible=!1,a.drawCursor()}).on("mousemove",function(){var t=h.c(a.svgElement);a.cursorData.x=S(a.xScale.invert(t[0])),a.cursorData.y=parseInt(a.yScale.invert(t[1])+.5),a.cursorData.visible=!0,a.drawCursor()}),a.menuZoomBehavior=h.f().scaleExtent([.8,5]).filter(function(){return a.altKey=h.b.altKey,!h.b.shiftKey&&!h.b.altKey}).on("start",function(){r=0,i=h.b.transform.k}).on("zoom",function(){r++,i!==h.b.transform.k&&(r+=10);var t=h.b.transform;a.props.onChangeParam&&(a.params.menuZoom=t,a.props.onChangeParam(a.params)),a.yScale.range([t.applyY(0),t.applyY(a.state.height)]),a.clearGrid(a.grid),a.clearGrid(a.menu),a.update(),a.cursorData.visible=!1,a.drawCursor()}).on("end",function(){r<5&&a.update()}),a.menu.call(a.menuZoomBehavior).on("dblclick.zoom",null),a.updateData(),a.marky.selectAll("rect").data([a.markyData]).enter().append("rect").attr("class","marky").attr("visibility","hidden").attr("stroke","none").attr("stroke-width",2),a.params.gridZoom){var o=a.params.gridZoom;a.base.call(a.gridZoomBehavior.transform,h.g.translate(o.x,0).scale(o.k))}else a.resetScreenPosition();if(a.params.menuZoom){var l=a.params.menuZoom;a.menu.call(a.menuZoomBehavior.transform,h.g.translate(0,l.y).scale(l.k))}a.update()},a.updateData=function(){var t=a.size(),e=t.width,r=(t.height,p=[0,0],[a.xScale.invert(p[0]),a.yScale.invert(p[1])]),i=a.xScale.invert(e)-a.xScale.invert(0),o=D,l=0;a.pointData.forEach(function(t,e){t.i=e,delete t.mark,t.time||(t.time=f(t)),o>t.x&&(o=t.x),l<t.x&&(l=t.x)}),o=o<0?parseInt(o/D)-1:parseInt(o/D),l=l<0?parseInt(l/D)-1:parseInt(l/D);var s=function(t){return t<0&&(t=(parseInt(t/D)-1)*D),parseInt(t/D)*D},c=s(r[0])-l*D,u=(parseInt(i/D)+2)*D-o*D+l*D,d=r[0],h=d+i;b(d),b(h),s(d),s(h);a.pointLoopData=[],a.lineLoopData=[];var p,m={},y=function(t,e){return t+e>=d&&t+e<=h},g=function(t,e,r){var i=null;return"undefined"===typeof m[t]&&(m[t]={}),(i=m[t][e.i])?i:((i=Object(n.a)({},e)).dx=r,i.x=e.x+i.dx,i.org=e,delete i.time,m[t][e.i]=i,a.pointLoopData.push(i),i)};a.lineData.forEach(function(t,e){for(e=c;e<c+u;e+=D)if(y(t.s.x,e)||y(t.d.x,e)){t.s.mark=!0,t.d.mark=!0;var r=g(e,t.s,e),i=g(e,t.d,e),o=Object(n.a)({},t);o.org=t,o.i=e,o.s=r,o.d=i,a.lineLoopData.push(o)}}),a.pointData.forEach(function(t){if(!t.mark)for(var e=c;e<c+u;e+=D)y(t.x,e)&&g(e,t,e);delete t.mark})},a.update=function(){Object(d.a)(Object(d.a)(a));var t=a.size();t.width,t.height;a.textData=[],a.pointLoopData.forEach(function(t,e){t.x=t.org.x+t.dx,t.org.selected&&(t.time||(t.time=f(t)),a.textData.push(t.time))}),a.line.selectAll("line.link").data(a.lineLoopData).exit().remove(),a.line.selectAll("line.link").data(a.lineLoopData).enter().append("line").classed("link",!0).attr("fill","none").style("pointer-events","none").attr("stroke-width",1),a.line.selectAll("line.selection").data(a.lineLoopData).exit().remove(),a.line.selectAll("line.selection").data(a.lineLoopData).enter().append("line").classed("selection",!0).attr("fill","none").attr("stroke","rgb(0,0,0,0)").attr("stroke-width",6),a.rect.selectAll("rect.link").data(a.pointLoopData).exit().remove(),a.rect.selectAll("rect.link").data(a.pointLoopData).enter().append("rect").classed("link",!0).attr("fill","rgba(0,0,0,0)").call(a.dragHandle).on("dblclick",function(t,e){console.log("dbl ".concat(e))}).on("mouseover",function(t,e){t.org.selected||(t.time||(t.time=f(t)),t.time&&a.textData.indexOf(t.time)<0&&a.textData.push(t.time),a.updateText())}).on("mouseout",function(t,e){t.org.selected||(t.time&&a.textData.splice(a.textData.indexOf(t.time),1),a.updateText())}),a.line.selectAll("line.link").attr("x1",function(t){return a.xScale(t.s.x)}).attr("y1",function(t){return a.yScale(t.s.y)}).attr("x2",function(t){return a.xScale(t.d.x)}).attr("y2",function(t){return a.yScale(t.d.y)}).attr("stroke",function(t){return t.org.selected?"#F00":"#999"}),a.line.selectAll("line.selection").attr("x1",function(t){return a.xScale(t.s.x)}).attr("y1",function(t){return a.yScale(t.s.y)}).attr("x2",function(t){return a.xScale(t.d.x)}).attr("y2",function(t){return a.yScale(t.d.y)}).on("click",function(t,e){var n=t.org;if(h.b.shiftKey){if(n.selected){a.lineData.forEach(function(t){t.s.lines||(t.s.lines=[]),t.d.lines||(t.d.lines=[]),t.s.lines.push(t),t.d.lines.push(t)});delete n.selected,function t(e){e.selected||(e.selected=!0,a.selectPoint(e.s),a.selectPoint(e.d),e.s.lines.forEach(function(e){t(e)}),e.d.lines.forEach(function(e){t(e)}))}(n),a.pointData.forEach(function(t){delete t.lines})}}else a.pointData.forEach(function(t){a.deselectPoint(t)}),a.lineData.forEach(function(t){delete t.selected});n.selected=!0,a.update()}),a.rect.selectAll("rect.link").attr("x",function(t){return a.xScale(t.x)-4}).attr("y",function(t){return a.yScale(t.y)-4}).attr("width",8).attr("height",8).attr("fill",function(t){return t.org.lastSelect?"#FF0000":"#00000000"}).attr("stroke",function(t){return t.org.selected?t.org.lastSelect?"#FF0000":"#FFA000":"#999"}).attr("stroke-width",1),a.updateGrid(a.grid,a.gridRectangles()),a.updateGrid(a.menu,a.menuRectangles()),a.updateText()},a.updateText=function(){a.text.selectAll("text").data(a.textData).exit().remove(),a.text.selectAll("text").data(a.textData).enter().append("text").style("pointer-events","none"),a.text.selectAll("text").each(function(t,e){t.update&&t.update()}).attr("fill",function(t){return t.color?t.color:"black"}).attr("font-size",function(t){return 18*t.fontSize}).attr("x",function(t){return a.xScale(t.x)+t.dx}).attr("y",function(t){return a.yScale(t.y)+t.dy}).attr("transform",function(t){return t.rotate?"rotate(".concat(t.rotate,",").concat(a.xScale(t.x),",").concat(a.yScale(t.y),")"):""}).text(function(t){return t.text})},a.updateMarky=function(){a.marky.selectAll("rect").attr("visibility",function(t){return t.visible?"visible":"hidden"}).attr("fill",function(t){return t.color?t.color:"none"}).attr("x",function(t){return t.width>=0?t.x:t.x+t.width}).attr("y",function(t){return t.height>=0?t.y:t.y+t.height}).attr("width",function(t){return t.width>=0?t.width:-t.width}).attr("height",function(t){return t.height>=0?t.height:-t.height})},a.gridRectangles=function(){var t,e=a.size(),n=e.width,r=e.height,i=(t=[0,0],[a.xScale.invert(t[0]),a.yScale.invert(t[1])]),o=a.xScale.invert(n)-a.xScale.invert(0),l=a.yScale.invert(r)-a.yScale.invert(0),s=a.xScale(3600)-a.xScale(0),c=[],u=[],d=[];c.push({color:"#00000000",x:i[0],y:i[1],width:o,height:l});!function(t){for(var e=0;e<o+4*t;e+=t){var n=e+i[0]-i[0]%(2*t)-2*t,r=i[1],c=parseInt(n+(n>0?.5:-.5)),h=null,f=null,m=1,y=.85,g="#808080",x=c;c<0&&(c=-(D+c)),c%D==0?(m=4,h=0===x||x===D?"#A0A0FF":"#E0E0E0",f=p(n),y=1,g="#404040",(n<0||n>=86400)&&(g="#A0A0A0")):c%3600==0?(m=2,h="#A0FFFF",f=p(n),y=1,g="#404040",(n<0||n>=86400)&&(g="#A0A0A0")):c%1800==0?(h="#A0FFFF",s/(a.gridScale.x+5)>=2&&(f=p(n))):c%900==0&&s/(a.gridScale.x+5)>=2?(h="#E0FFFF",s/(a.gridScale.x+5)>=4&&(f=p(n))):c%300==0&&s/(a.gridScale.x+5)>=4?(h="#E0FFFF",s/(a.gridScale.x+5)>=12&&(f=p(n))):c%60==0&&s/(a.gridScale.x+5)>=12&&(h="#E0FFFF",s/(a.gridScale.x+5)>=60&&(f=p(n).slice(-2))),h&&(u.push({x1:a.xScale(n),y1:a.yScale(r),x2:a.xScale(n),y2:a.yScale(r+l),color:h,width:m}),f&&d.push({x:n,y:r,dx:4,dy:-3,rotate:90,name:f,color:g,fontSize:y}))}}(60);for(var h=0;h<l+4;h+=1){var f=i[0],m=parseInt(h+i[1]-i[1]%2-2+.5);if(m>=1&&m<=a.busStops.length){var y=a.busStops[m-1],g={x1:a.xScale(f),y1:a.yScale(m),x2:a.xScale(f+o),y2:a.yScale(m),color:"#80FFFF",width:1};y.selected&&(g.color="red"),u.push(g)}}return{rectData:c,lineData:u,textData:d}},a.menuRectangles=function(){var t,e=a.size(),n=e.width,r=e.height,i=(t=[0,0],[a.xScale.invert(t[0]),a.yScale.invert(t[1])]),o=(a.xScale.invert(n),a.xScale.invert(0),a.yScale.invert(r)-a.yScale.invert(0)),l=a.xScale.invert(v)-a.xScale.invert(0),s=[],c=[],u=[];s.push({color:"#F8F8F8D0",x:i[0],y:i[1],width:l,height:o}),c.push({color:"#D0D0D0",x1:v,y1:0,x2:v,y2:r,width:1});for(var d=0;d<o+4;d+=1){var h=i[0],p=parseInt(d+i[1]-i[1]%2-2+.5);if(p>=1&&p<=a.busStops.length){var f=a.busStops[p-1],m={x1:a.xScale(h),y1:a.yScale(p),x2:a.xScale(h+l),y2:a.yScale(p),color:"#80FFFF",width:1};f.selected&&(m.color="red"),c.push(m);var y={x:h,y:p,dx:4,dy:-4,name:f.name,color:"#404040",index:p,fontSize:1};f.selected&&(y.color="red"),u.push(y)}}return{rectData:s,lineData:c,textData:u}},a.clearGrid=function(t){t.selectAll("line.stops").remove(),t.selectAll("text.stops").remove(),t.selectAll("rect.stops").remove()},a.updateGrid=function(t,e){var n=e.rectData,r=e.lineData,i=e.textData;t.selectAll("rect.stops").data(n).exit().remove(),t.selectAll("rect.stops").data(n).enter().append("rect").classed("stops",!0).attr("stroke","none").attr("stroke-width",2).attr("fill",function(t){return t.color?t.color:"none"}).attr("x",function(t){return a.xScale(t.x)}).attr("y",function(t){return a.yScale(t.y)}).attr("width",function(t){return a.xScale(t.width)-a.xScale(0)}).attr("height",function(t){return a.yScale(t.height)-a.yScale(0)}),t.selectAll("line.stops").data(r).exit().remove(),t.selectAll("line.stops").data(r).enter().append("line").classed("stops",!0).attr("fill","rgba(0,0,0,0)").attr("stroke",function(t){return t.color?t.color:"none"}).attr("stroke-width",function(t){return t.width}).attr("stroke-dasharray",function(t){return t.stroke?t.stroke:"none"}).attr("x1",function(t){return t.x1}).attr("y1",function(t){return t.y1}).attr("x2",function(t){return t.x2}).attr("y2",function(t){return t.y2}).on("click",function(t,e){}).on("mouseover",function(t,e){}),t.selectAll("text.stops").data(i).exit().remove(),t.selectAll("text.stops").data(i).enter().append("text").classed("stops",!0).attr("fill",function(t){return t.color?t.color:"black"}).attr("font-size",function(t){return 13*t.fontSize}).attr("x",function(t){return a.xScale(t.x)+t.dx}).attr("y",function(t){return a.yScale(t.y)+t.dy}).attr("text-anchor","start").attr("transform",function(t){return t.rotate?"rotate(".concat(t.rotate,",").concat(a.xScale(t.x),",").concat(a.yScale(t.y),")"):""}).text(function(t){return""==t.name?"\u540d\u79f0\u672a\u8a2d\u5b9a":t.name}).on("dblclick",function(t,e){}).on("click",function(t,e){if("undefined"!==typeof t.index){var n=a.busStops[t.index-1];if(n.selected){var r=a.busStops[t.index-1];a.props.onEditBusStop&&a.props.onEditBusStop({name:r.name,data:a.busStopData(t.index),index:t.index})}else a.busStops.forEach(function(t){delete t.selected}),n.selected=!0,a.clearGrid(a.grid),a.clearGrid(a.menu),a.updateGrid(a.grid,a.gridRectangles()),a.updateGrid(a.menu,a.menuRectangles())}}).on("mouseover",function(t,e){t.index})},a.drawCursor=function(){a.props.readOnly||(a.cursor.selectAll("rect").remove(),a.cursor.append("rect").attr("fill","none").attr("x",a.xScale(a.cursorData.x)-4).attr("y",a.yScale(a.cursorData.y)-4).attr("visibility",a.cursorData.visible&&a.altKey?"visible":"hidden").attr("width",8).attr("height",8).attr("stroke-width",1).attr("stroke","#999").on("click",function(t,e){}))},a.onKeyDown=function(t){if(a.altKey=t.altKey,(8===t.keyCode||46===t.keyCode)&&(t.preventDefault(),!a.props.readOnly)){var e=!1,n=E(y(Object(d.a)(Object(d.a)(a))));a.lineData.forEach(function(t){(t.s.selected||t.d.selected)&&(t.selected=!0)});var r=[];a.pointData.forEach(function(t){t.selected?(e=!0,t.time&&a.textData.splice(a.textData.indexOf(t.time),1)):r.push(t)});var i=[];a.lineData.forEach(function(t){t.selected||i.push(t)}),e&&a.setUndo(n),a.pointData=r,a.lineData=i,a.onChange(),a.updateData(),a.update()}if(13===t.keyCode&&(t.preventDefault(),!a.props.readOnly)){var o=E(y(Object(d.a)(Object(d.a)(a)))),l=0;if(a.busStops.some(function(t,e){return!!t.selected&&(l=e+1,!0)}),l>=1&&l<=a.busStops.length){if(t.shiftKey){if(a.busStops.length<=2||l<2)return;x(Object(d.a)(Object(d.a)(a)),l-2),a.setUndo(o)}else g(Object(d.a)(Object(d.a)(a)),l-1),a.setUndo(o);a.onChange(),a.updateData(),a.clearGrid(a.grid),a.clearGrid(a.menu),a.update()}}37===t.keyCode&&t.preventDefault(),39===t.keyCode&&t.preventDefault(),t.metaKey&&90===t.keyCode&&(t.preventDefault(),a.props.readOnly||(t.shiftKey?a.doRedo():a.doUndo()))},a.onKeyUp=function(t){a.props.readOnly||(a.altKey=t.altKey)},a.onMouseLeave=function(t){t.shiftKey&&(a.marky.width=0,a.marky.height=0)},a.onChange=function(){var t=y(Object(d.a)(Object(d.a)(a)));a.props.onChangeData&&a.props.onChangeData(t)},a.setUndo=function(t){a.undoBuffer=a.undoBuffer.slice(0,a.undoPtr),a.undoBuffer.push(t),a.undoPtr++},a.doUndo=function(){if(a.undoPtr>0){a.undoPtr--;var t=a.undoBuffer[a.undoPtr];a.loadData(t),a.props.onChangeData&&a.props.onChangeData(t)}},a.doRedo=function(){if(a.undoBuffer.length>a.undoPtr){var t=a.undoBuffer[a.undoPtr];a.loadData(t),a.props.onChangeData&&a.props.onChangeData(t),a.undoPtr++}},a.resetScreenPosition=function(){var t=a.size(),e=t.width;t.height;a.xScale.domain([0,e*a.timeLineWidth()]).range([0,e]);var n=(e-v)/(24*a.gridScale.x);a.base.call(a.gridZoomBehavior.transform,h.g.translate(a.gridScale.x*(v/a.gridScale.x),0).scale(n)),a.menu.call(a.menuZoomBehavior.transform,h.g.translate(0,0).scale(1))},a.changeBusStop=function(t){if(!a.props.readOnly){var e=t.index-1;if(e>=0&&e<a.busStops.length){var n=t.name.trim().replace(/\s/g,"");if(a.busStops[e].name!==n){var r=E(y(Object(d.a)(Object(d.a)(a))));a.busStops[e].name=n,a.onChange(),a.setUndo(r)}}}};var i=t.diagramData,s=m(k(i)),c=s.busStops,u=s.lineData,w=s.pointData;return a.state={width:t.width,height:t.height},a.markyData={x:100,y:200,width:200,height:100,color:"rgba(0,0,0,0.1)",visible:!1},a.lineData=u,a.pointData=w,a.busStops=c,a.lineLoopData=[],a.pointLoopData=[],a.textData=[],a.cursorData={x:0,y:0,visible:!0},a.gridScale={x:25,y:25,dy:-4},a.params=Object(n.a)({},t.params),a.undoPtr=0,a.undoBuffer=[],a.altKey=!1,a}return Object(s.a)(e,t),Object(i.a)(e,[{key:"componentDidMount",value:function(){this.initialize()}},{key:"componentWillUnmount",value:function(){}},{key:"componentDidUpdate",value:function(){var t=this.size(),e=t.width,a=t.height,n=h.h(this.base.node()),r=h.h(this.menu.node());this.xScale.domain([0,e*this.timeLineWidth()]).range([n.applyX(0),n.applyX(e)]),this.yScale.domain([this.gridScale.dy,a*this.busLineHeight()+this.gridScale.dy]).range([r.applyY(0),r.applyY(a)]),this.updateData(),this.clearGrid(this.grid),this.clearGrid(this.menu),this.update()}},{key:"componentWillReceiveProps",value:function(t){var e={};this.props.width!=t.width&&(e.width=t.width),this.props.height!=t.height&&(e.height=t.height),this.props.diagramData!=t.diagramData&&this.loadData(t.diagramData),this.setState(e)}},{key:"busStopData",value:function(t){var e=this,a=[],r=this.busStops[t-1].name;this.pointData.forEach(function(t,e){t.idx=e,delete t.mark,delete t.lines}),this.lineData.forEach(function(t){"undefined"===typeof t.s.lines&&(t.s.lines=[]),"undefined"===typeof t.d.lines&&(t.d.lines=[]),t.s.lines.push(t),t.d.lines.push(t)}),this.pointData.forEach(function(e){e.y===t&&a.push(e)});var i=a.map(function(t){var a=[],r=[];if(function t(e,a,n,r){e.mark||(n.y===e.y&&r.push(e),a.push(e),e.mark=!0,e.lines.forEach(function(e){t(e.s,a,n,r),t(e.d,a,n,r)}))}(t,a,t,r),a.length>1){a.sort(function(t,e){return t.y>e.y?1:t.y<e.y?-1:0});var i=a[0],o=a[a.length-1];r.sort(function(t,e){return t.x>e.x?1:t.x<e.x?-1:0});var l=Object(n.a)({},r[r.length-1]);i.x<o.x?(l.dir="down",l.departure=e.busStops[i.y-1],l.arrival=e.busStops[o.y-1]):(l.dir="up",l.departure=e.busStops[o.y-1],l.arrival=e.busStops[i.y-1]),l.x=b(l.x);var s=parseInt(l.x+.5);return l.sec=parseInt(s%60),l.min=parseInt(s/60)%60,l.hour=parseInt(parseInt(s/60)/60),l}return null}).filter(function(t){return null!==t}).sort(function(t,e){return t.x>e.x?1:t.x<e.x?-1:0});return this.pointData.forEach(function(t){delete t.idx,delete t.mark,delete t.lines}),{name:r,times:i}}},{key:"render",value:function(){var t=this;return u.a.createElement("div",{ref:function(e){return t.container=e},style:{display:"inline-block",marign:0,padding:0,width:this.state.width,overflow:"hidden",border:"solid 1px lightgray"},tabIndex:this.props.tabIndex,focusable:!0,onKeyDown:this.onKeyDown,onKeyUp:this.onKeyUp,onMouseLeave:this.onMouseLeave},u.a.createElement("svg",{ref:function(e){t.svgElement=e,t.svg=h.e(e)},width:"100%",height:this.state.height,style:{marign:0}},u.a.createElement("g",{ref:function(e){return t.base=h.e(e)}},u.a.createElement("g",{ref:function(e){return t.axis=h.e(e)},style:{visibility:"hidden"}}),u.a.createElement("g",{ref:function(e){return t.grid=h.e(e)}}),u.a.createElement("g",{ref:function(e){return t.line=h.e(e)}}),u.a.createElement("g",{ref:function(e){return t.rect=h.e(e)}}),u.a.createElement("g",{ref:function(e){return t.cursor=h.e(e)}}),u.a.createElement("g",{ref:function(e){return t.text=h.e(e)}}),u.a.createElement("g",{ref:function(e){return t.marky=h.e(e)}})),u.a.createElement("g",{ref:function(e){return t.menu=h.e(e)}})))}},{key:"diagramData",get:function(){var t=y(this);return E(t)}}]),e}(c.Component);w.defaultProps={params:{},readOnly:!1,tabIndex:0};var O=a(103),C=a(100),j=a(101),P=a(105),F=function(t){function e(t){var a;return Object(r.a)(this,e),(a=Object(o.a)(this,Object(l.a)(e).call(this,t))).onClose=function(){a.props.onClose&&a.props.onClose()},a.onEdited=function(){a.props.onEdited&&a.props.onEdited({name:a.state.name})},a.state=Object(n.a)({},t.busStop),a}return Object(s.a)(e,t),Object(i.a)(e,[{key:"componentWillReceiveProps",value:function(t){this.props.busStop!==t.busStop&&this.setState(Object(n.a)({},t.busStop))}},{key:"render",value:function(){for(var t=this,e=[],a=0;a<24;a++)e.push([]);return this.state.data.times&&this.state.data.times.forEach(function(t){e[t.hour].push(t)}),u.a.createElement(O.a,{show:this.props.show,size:"lg",onHide:this.onClose},u.a.createElement(O.a.Header,{closeButton:!0},u.a.createElement(O.a.Title,null,"\u6a19\u67f1\u30c7\u30fc\u30bf")),u.a.createElement(O.a.Body,null,u.a.createElement(C.a,null,u.a.createElement(j.a,{md:12},u.a.createElement("input",{type:"text",style:{width:"100%",marginBottom:10},value:this.state.name,onChange:function(e){t.setState({name:e.target.value})},placeholder:"\u6a19\u67f1\u540d",readOnly:this.props.readOnly?"readonly":null}))),u.a.createElement(C.a,null,u.a.createElement(j.a,{md:12},u.a.createElement("table",{style:{width:"100%",fontSize:12}},u.a.createElement("thead",null,u.a.createElement("tr",{key:a,style:{border:"solid 1px lightgray"}},u.a.createElement("th",{width:50},u.a.createElement("span",{style:{margin:10}})),u.a.createElement("th",{style:{borderLeft:"solid 1px lightgray",width:"50%",textAlign:"center"}},u.a.createElement("span",null,"\u4e0a\u308a")),u.a.createElement("th",{style:{borderLeft:"solid 1px lightgray",width:"50%",textAlign:"center"}},u.a.createElement("span",null,"\u4e0b\u308a")))),u.a.createElement("tbody",null,e.map(function(t,e){return u.a.createElement("tr",{key:e,style:{border:"solid 1px lightgray"}},u.a.createElement("td",{width:50},u.a.createElement("span",{style:{margin:10}},("00"+e).slice(-2))),u.a.createElement("td",{style:{borderLeft:"solid 1px lightgray",width:"50%"}},u.a.createElement("span",null,t.filter(function(t){return"up"===t.dir}).map(function(t){return"".concat(t.min)}).join(", "))),u.a.createElement("td",{style:{borderLeft:"solid 1px lightgray",width:"50%"}},u.a.createElement("span",null,t.filter(function(t){return"down"===t.dir}).map(function(t){return"".concat(t.min)}).join(", "))))})))))),u.a.createElement(O.a.Footer,null,u.a.createElement(P.a,{onClick:this.onEdited},"OK")))}}]),e}(c.Component);F.defaultProps={show:!1,busStop:{name:"",data:{}},readOnly:!1};var L=a(90),A=a.n(L),B=(a(97),a(98),function(t){function e(t){var a;return Object(r.a)(this,e),(a=Object(o.a)(this,Object(l.a)(e).call(this,t))).onClose=function(){a.props.onClose&&a.props.onClose()},a.onEdited=function(){a.props.onEdited&&a.props.onEdited(a.state.text)},a.onChangeText=function(t){a.setState({text:t})},a.state={text:t.text},a}return Object(s.a)(e,t),Object(i.a)(e,[{key:"componentWillReceiveProps",value:function(t){this.props.text!==t.text&&this.setState({text:null===t.text?"":t.text})}},{key:"render",value:function(){var t=this;return u.a.createElement(O.a,{show:this.props.show,size:"lg",onHide:this.onClose},u.a.createElement(O.a.Header,{closeButton:!0},u.a.createElement(O.a.Title,null,"\u30c0\u30a4\u30a2\u30b0\u30e9\u30e0\u30c7\u30fc\u30bf")),u.a.createElement(O.a.Body,null,u.a.createElement(C.a,null,u.a.createElement(j.a,{md:12},u.a.createElement(A.a,{ref:function(e){return t.editor=e},style:{display:"inline-block",border:"solid 1px lightgray"},mode:"text",theme:"chrome",value:this.state.text,width:"100%",height:"".concat(this.props.height,"px"),onChange:this.onChangeText,showPrintMargin:!1,fontSize:12,name:"digram_data_dialog",editorProps:{$blockScrolling:1/0},readOnly:this.props.readonly})))),u.a.createElement(O.a.Footer,null,u.a.createElement(P.a,{onClick:this.onEdited},"OK")))}}]),e}(c.Component));B.defaultProps={show:!1,name:"",height:100},a.d(e,"default",function(){return K});var I={getItem:function(t,e){var a=localStorage.getItem("".concat("diagram","-").concat(t));return null!==a?JSON.parse(a).data:e},setItem:function(t,e){localStorage.setItem("".concat("diagram","-").concat(t),JSON.stringify({data:e}))}},K=function(t){function e(t){var a;return Object(r.a)(this,e),(a=Object(o.a)(this,Object(l.a)(e).call(this,t))).onResize=function(){a.setState({width:window.innerWidth,height:window.innerHeight},a.update)},a.onEditBusStop=function(t){a.setState({showBusStopDialog:!0,busStop:t})},a.onCloseBusStop=function(){a.setState({showBusStopDialog:!1})},a.onEditedBusStop=function(t){a.diagramView.changeBusStop(Object(n.a)({},a.state.busStop,{name:t.name})),a.setState({showBusStopDialog:!1})},a.openDiagramDataDialog=function(){a.setState({showDiagramDataDialog:!0,diagramEditData:a.diagramView.diagramData})},a.onEditedDiagramData=function(t){a.setState({showDiagramDataDialog:!1,diagramData:t})},a.onCloseDiagramData=function(){a.setState({showDiagramDataDialog:!1})},a.onChangeData=function(t){I.setItem("data",a.diagramView.diagramData)},a.onChangeParam=function(t){I.setItem("params",t)},a.resetScreenPosition=function(){a.diagramView.resetScreenPosition()},a.state={showBusStopDialog:!1,busStop:{name:"",data:{}},params:I.getItem("params",{}),width:window.innerWidth,height:window.innerHeight,diagramData:I.getItem("data",""),diagramEditData:""},a}return Object(s.a)(e,t),Object(i.a)(e,[{key:"componentDidMount",value:function(){window.addEventListener("resize",this.onResize,!1)}},{key:"componentWillUnmount",value:function(){window.removeEventListener("resize",this.onResize)}},{key:"render",value:function(){var t=this;return u.a.createElement("div",{style:{overflow:"hidden"}},u.a.createElement("nav",{className:"navbar sticky-top navbar-light bg-light"},u.a.createElement("a",{className:"navbar-brand",href:"#"},"\u30c0\u30a4\u30a2\u30b0\u30e9\u30e0\u30a8\u30c7\u30a3\u30bf"),u.a.createElement("div",null,u.a.createElement("a",{href:"https://docs.google.com/presentation/d/1F0RfbHgcRPHgPSxpe61pBMZ8Yf0WGaXe7XT06Y3AWkk/edit?usp=sharing",target:"manual",className:"btn btn-sm btn-outline-secondary",style:{marginRight:10},role:"button"},"\u4f7f\u3044\u65b9"),u.a.createElement("button",{className:"btn btn-sm btn-outline-secondary",style:{marginRight:10},type:"button",onClick:this.resetScreenPosition},"\u521d\u671f\u4f4d\u7f6e"),u.a.createElement("button",{className:"btn btn-sm btn-outline-secondary",type:"button",onClick:this.openDiagramDataDialog},"\u30c7\u30fc\u30bf"))),u.a.createElement(w,{ref:function(e){return t.diagramView=e},onEditBusStop:this.onEditBusStop,onChangeData:this.onChangeData,onChangeParam:this.onChangeParam,diagramData:this.state.diagramData,params:this.state.params,width:this.state.width-2,height:this.state.height-26-38-10}),u.a.createElement(F,{busStop:this.state.busStop,show:this.state.showBusStopDialog,onClose:this.onCloseBusStop,onEdited:this.onEditedBusStop}),u.a.createElement(B,{show:this.state.showDiagramDataDialog,text:this.state.diagramEditData,onClose:this.onCloseDiagramData,onEdited:this.onEditedDiagramData,height:this.state.height-240}))}}]),e}(c.Component);K.defaultProps={}}}]);
//# sourceMappingURL=1.949f4aef.chunk.js.map