(window.webpackJsonp=window.webpackJsonp||[]).push([[2],{107:function(t,e,n){"use strict";n.r(e),n.d(e,"default",function(){return v});var o=n(99),r=n.n(o),a=n(102),u=n(8),c=n(9),s=n(12),i=n(10),p=n(11),l=n(1),d=n.n(l),f=(n(103),"https://api-tokyochallenge.odpt.org/api/v4"),m="BusTimetable",b="BusstopPole",h="BusroutePattern",v=function(t){function e(t){var n;return Object(u.a)(this,e),(n=Object(s.a)(this,Object(i.a)(e).call(this,t))).loadJSON=function(){var t=Object(a.a)(r.a.mark(function t(e){return r.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.abrupt("return",new Promise(function(t){fetch("".concat(f,"/odpt:").concat(e,"?odpt:operator=odpt.Operator:").concat(n.state.operator,"&acl:consumerKey=").concat(n.state.consumerKey)).then(function(t){return t.json()}).then(function(e){console.log("parsed json",e),t(e)}).catch(function(t){console.log("parsing failed",t)})}));case 1:case"end":return t.stop()}},t,this)}));return function(e){return t.apply(this,arguments)}}(),n.load=Object(a.a)(r.a.mark(function t(){var e,o,a,u,c,s,i,p,l,d,f;return r.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return l=function(t){return t.map(function(t){var e=c[t["odpt:busstopPole"]];return t.title=e?e["dc:title"]:p(t["odpt:busstopPole"]),t.pole=p(t["odpt:busstopPole"]),delete t["odpt:busstopPole"],t})},p=function(t){var e=t.match(/^odpt\.BusstopPole:(.+)/);return e?e[1]:t},i=function(t){var e=t.match(/^odpt\.Busroute:(.+)/);return e?e[1]:t},t.next=5,n.loadJSON(b);case 5:return e=t.sent,t.next=8,n.loadJSON(h);case 8:return o=t.sent,t.next=11,n.loadJSON(m);case 11:a=t.sent,u=o,c=function(){var t={};return e.forEach(function(e){t[e["owl:sameAs"]]=e}),t}(),s=function(){var t={};return a.forEach(function(e){var n=e["odpt:busroutePattern"];null==t[n]&&(t[n]=[]),t[n].push(e)}),t}(),d={},u.forEach(function(t){var e=i(t["odpt:busroute"]);null==d[e]&&(d[e]={title:t["dc:title"],route:[]});var n={note:t["odpt:note"],direction:t["odpt:direction"],pattern:t["odpt:pattern"],order:l(t["odpt:busstopPoleOrder"]),route:i(t["odpt:busroute"])},o="odpt.BusroutePattern:".concat(n.route,".").concat(n.pattern,".").concat(n.direction),r=s[o];if(r){var a=r.map(function(t){return t["odpt:busTimetableObject"].map(function(t){var e=t["odpt:departureTime"];return e?{pole:p(t["odpt:busstopPole"]),time:e}:{pole:p(t["odpt:busstopPole"]),time:t["odpt:arrivalTime"]}})}),u=n.order;n.times=function(t,e){return t.map(function(t){var n=[],o=-1;return t.forEach(function(t,r){for(;o<e.length;){if(e[++o].pole===t.pole){n.push(t);break}n.push({pole:t.pole,time:"-"})}}),n})}(a,u),a.length>0&&d[e].route.push(n)}}),f={},Object.keys(d).forEach(function(t){d[t].route.forEach(function(e){f["".concat(d[t].title," ").concat(e.note)]={title:"".concat(d[t].title," ").concat(e.note),busStops:"".concat(e.order.map(function(t){return t.title}).map(function(t){return t.replace(/\s/g,"")}).join(" ")),times:"".concat(e.times.map(function(t){return t.map(function(t){return t.time}).join(" ")}).join("\n"))}})}),n.setState({busRouteTable:Object.keys(f).map(function(t){return f[t]})});case 20:case"end":return t.stop()}},t,this)})),n.onClickHandler=function(t){return function(){console.log(n.state.busRouteTable[t])}},n.state={consumerKey:"",operator:"KantoBus",busRouteTable:[]},n}return Object(p.a)(e,t),Object(c.a)(e,[{key:"render",value:function(){var t=this;return d.a.createElement("div",{style:{overflow:"hidden"}},d.a.createElement("nav",{className:"navbar sticky-top navbar-light bg-light"},d.a.createElement("a",{className:"navbar-brand",href:"#"},"\u6771\u4eac\u516c\u5171\u4ea4\u901a\u30aa\u30fc\u30d7\u30f3\u30c7\u30fc\u30bf\u30c1\u30e3\u30ec\u30f3\u30b8"),d.a.createElement("div",null)),d.a.createElement("input",{type:"text",style:{width:"100%",marginBottom:10},value:this.state.consumerKey,onChange:function(e){t.setState({consumerKey:e.target.value})}}),d.a.createElement("button",{onClick:this.load},"\u8aad\u307f\u8fbc\u307f"),this.state.busRouteTable.map(function(e,n){return d.a.createElement("p",{key:n,onClick:t.onClickHandler(n)}," ",e.title," ")}))}}]),e}(l.Component);v.defaultProps={}}}]);
//# sourceMappingURL=2.aa6bcfb5.chunk.js.map