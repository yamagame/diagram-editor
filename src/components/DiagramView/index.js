import React, { Component } from 'react';
import * as d3 from 'd3';
import * as Utils from './utils';

const timeUnit = 1000;
const menuWidth = 150;
const oneday = Utils.oneday;

const limit24 = (v) => {
  if (v < 0) v += oneday;
  return v % oneday;
}

const limitMin = (v) => {
  if (v < 0) {
    return parseInt((v-60+30)/60)*60
  }
  return parseInt((v+30)/60)*60;
}

const textDiagramData = (t) => {
  return `${t.busStops.split('\n').join(' ')}\n${t.timeLines.join('\n')}\n`;
}

const parseDiagramText = (diagramData) => {
  const t = diagramData.split('\n');
  let busStops = null;
  let timeLines = null;
  t.some( (s, i) => {
    if (s.indexOf('/') == 0) return false;
    if (busStops === null) {
      busStops = s;
      return false;
    }
    if (timeLines === null) {
      timeLines = i;
    }
    return true;
  })
  return {
    busStops: busStops !== null ? busStops.split(' ').join('\n') : '',
    timeLines: timeLines !== null ? t.slice(timeLines).join('\n') : '',
  }
}

export default class DiagramView extends Component {
  constructor(props) {
    super(props);
    const { diagramData } = props;
    const {
      busStops,
      lineData,
      pointData,
    } = Utils.load(parseDiagramText(diagramData));
    this.state = {
      width: props.width,
      height: props.height,
    }
    this.markyData = {
      x: 100, y: 200, width: 200, height: 100, color: 'rgba(0,0,0,0.1)', visible: false,
    }
    this.lineData = lineData;
    this.pointData = pointData;
    this.busStops = busStops;
    this.lineLoopData = [];
    this.pointLoopData = [];
    this.textData = [];
    this.cursorData = {
      x: 0, y: 0, visible: true,
    }
    this.gridScale = {
      x: 25,
      y: 25,
      dy: -4,
    }
    this.params = { ...props.params };
    this.undoPtr = 0;
    this.undoBuffer = [];
    this.altKey = false;
  }

  componentDidMount() {
    this.initialize();
  }
  
  componentWillUnmount() {
  }

  componentDidUpdate() {
    const { width, height } = this.size();
    const transformX = d3.zoomTransform(this.base.node());
    const transformY = d3.zoomTransform(this.menu.node());
    this.xScale.domain([0, width*this.timeLineWidth()]).range([transformX.applyX(0), transformX.applyX(width)]);
    this.yScale.domain([this.gridScale.dy, height*this.busLineHeight()+this.gridScale.dy]).range([transformY.applyY(0), transformY.applyY(height)]);
    this.updateData()
    this.clearGrid(this.grid);
    this.clearGrid(this.menu);
    this.update();
  }

  componentWillReceiveProps(nextProps) {
    let state = {}
    if (this.props.width != nextProps.width) {
      state.width = nextProps.width;
    }
    if (this.props.height != nextProps.height) {
      state.height = nextProps.height;
    }
    if (this.props.diagramData != nextProps.diagramData) {
      this.loadData(nextProps.diagramData);
    }
    this.setState(state);
  }

  size = () => {
    return {
      width: this.state.width,
      height: this.state.height,
    }
  }

  loadData = (diagramData) => {
    const {
      busStops,
      lineData,
      pointData,
    } = Utils.load(parseDiagramText(diagramData));
    this.lineData = lineData;
    this.pointData = pointData;
    this.busStops = busStops;
    this.lineLoopData = [];
    this.pointLoopData = [];
    this.textData = [];
    this.componentDidUpdate();
  }

  timeLineWidth = () => {
    return 60*60/this.gridScale.x;
  }

  busLineHeight = () => {
    return 1/this.gridScale.y;
  }

  makeLine = (s, d) => {
    this.lineData.push({
      s: s,
      d: d,
    })
    this.deleteDoubleLine();
  }

  selectPoint = (_d) => {
    _d.selected = true;
  }

  deselectPoint = (_d) => {
    delete _d.selected;
    delete _d.lastSelect;
  }

  deleteDoubleLine = () => {
    const lineKey = {};
    const lineData = [];
    this.pointData.forEach( (d, i) => {
      d.index = i;
    })
    this.lineData.forEach( d => {
      let key = `${d.d.index}-${d.s.index}`;
      if (d.s.index < d.d.index) {
        key = `${d.s.index}-${d.d.index}`;
      }
      if (typeof lineKey[key] === 'undefined') {
        lineData.push(d);
        lineKey[key] = d;
      }
    })
    this.lineData = lineData;
  }

  initialize = () => {
    const { width, height } = this.size();

    this.xScale = d3.scaleLinear()
      .domain([0, width*this.timeLineWidth()])
      .range([0, width]);

    this.yScale = d3.scaleLinear()
      .domain([this.gridScale.dy, height*this.busLineHeight()+this.gridScale.dy])
      .range([0, height]);

    //ポイントのドラッグ
    this.dragHandle = d3.drag()
      .on('start', (_d, i) => {
        if (!this.props.readOnly) {
          const d = _d.org;
          this.cursorData.visible = false;
          this.drawCursor();
          let s = null;
          let spindex = 0;
          this.pointData.some( (d, i) => {
            if (d.selected && d.lastSelect) {
              s = d;
              spindex = i;
              return true;
            }
            return false;
          })
          this.altKey = d3.event.sourceEvent.altKey;
          if (d3.event.sourceEvent.altKey && s !== null && spindex !== i) {
            //配置済みの点との接続
            const b = textDiagramData(Utils.save(this));
            const pointLen = this.pointData.length;
            const lineLen = this.lineData.length;
            this.pointData.forEach( d => {
              delete d.lastSelect;
            })
            d.lastSelect = true;
            this.selectPoint(d);
            const ended = (_d, i) => {
              const d = _d.org;
              this.makeLine(s, d);
              this.onChange();
              this.updateData();
              this.update();
              if (this.pointData.length != pointLen || this.lineData.length != lineLen) {
                this.setUndo(b);
              }
            }
            d3.event.on("end", ended);
          } else {
            //点のドラッグ
            const b = textDiagramData(Utils.save(this));
            let drag = false;
            let clear = false;
            if (!d.selected) {
              clear = true;
            }
            this.pointData.forEach( d => {
              delete d.lastSelect;
            })
            d.lastSelect = true;
            this.selectPoint(d);
            this.pointData.forEach( d => {
              if (d.selected) {
                d.ox = this.xScale(d.x);
                d.oy = this.yScale(d.y);
              }
            })
            const dragged = (_d) => {
              const d = _d.org;
              drag = true;
              if (!d3.event.sourceEvent.shiftKey && clear) {
                this.pointData.forEach( d => {
                  this.deselectPoint(d);
                })
                this.lineData.forEach( d => {
                  delete d.selected;
                })
                this.selectPoint(d);
              }
              this.pointData.forEach( d => {
                if (d.selected) {
                  d.ox += d3.event.dx;
                  d.oy += d3.event.dy;
                  d.x = limitMin(this.xScale.invert(d.ox));
                  //d.y = this.yScale.invert(d.oy);
                }
              })
              this.update();
            }
            const ended = (_d, i) => {
              const d = _d.org;
              if (!drag) {
                if (!d3.event.sourceEvent.shiftKey && clear) {
                  this.pointData.forEach( d => {
                    this.deselectPoint(d);
                  })
                  this.lineData.forEach( d => {
                    delete d.selected;
                  })
                  this.selectPoint(d);
                  d.lastSelect = true;
                }
              } else {
                this.setUndo(b);
              }
              this.pointData.forEach( d => {
                delete d.ox;
                delete d.oy;
              })
              this.onChange();
              this.update();
            }
            d3.event.on("drag", dragged).on("end", ended);
          }
        }
      })

    this.dragMarky = d3.drag()
      .on('start', (d, i) => {
        this.cursorData.visible = false;
        this.drawCursor();
        this.altKey = d3.event.sourceEvent.altKey;
        //ポイントの作成
        if (d3.event.sourceEvent.altKey) {
          if (!this.props.readOnly) {
            const b = textDiagramData(Utils.save(this));

            let lastSelected = null;
            let spindex = 0;
            this.pointData.some( (d, i) => {
              if (d.selected && d.lastSelect) {
                lastSelected = d;
                spindex = i;
                return true;
              }
              return false;
            })

            this.pointData.forEach( d => {
              delete d.lastSelect;
            })

            const p = {
              x: this.cursorData.x,
              y: this.cursorData.y,
              selected: true,
              lastSelect: true,
            }
            this.selectPoint(p);
            this.pointData.push(p)

            if (lastSelected) {
              this.makeLine(lastSelected, p);
            }

            this.onChange();
            this.updateData();
            this.update();
            this.cursorData.visible = false;
            this.drawCursor();

            this.setUndo(b);
          }
        }
        //マーキーの処理
        if (d3.event.sourceEvent.shiftKey) {
          const marky = this.marky;
          const bar = d3.select(this.bar);
          let doDrag = false;
          let x = d3.event.x;
          let y = d3.event.y;
          this.markyData.x = x;
          this.markyData.y = y;
          this.markyData.width  = 0;
          this.markyData.height = 0;
          const dragged = (d) => {
            if (!doDrag) {
              x = d3.event.x;
              y = d3.event.y;
              this.markyData.x = x;
              this.markyData.y = y;
              this.markyData.width  = 0;
              this.markyData.height = 0;
              doDrag = true;
            }
            x += d3.event.dx;
            y += d3.event.dy;
            this.markyData.width  = x-this.markyData.x;
            this.markyData.height = y-this.markyData.y;
            this.markyData.visible = true;
            this.updateMarky();
          }
          const ended = () => {
            this.markyData.visible = false;
            this.updateMarky();

            let x1 = this.markyData.x;
            let y1 = this.markyData.y;
            let x2 = this.markyData.x+this.markyData.width;
            let y2 = this.markyData.y+this.markyData.height;
            let t;

            t = x1;
            if (x2 < x1) {
              x1 = x2;
              x2 = t;
            }
            t = y1;
            if (y2 < y1) {
              y1 = y2;
              y2 = t;
            }

            const convert = (p) => {
              return [this.xScale.invert(p[0]), this.yScale.invert(p[1])];
            }

            const p1 = convert([x1, y1]);
            const p2 = convert([x2, y2]);

            this.pointLoopData.forEach( d => {
              if (d3.event.sourceEvent.shiftKey && d.org.selected) {
                return true;
              }
              const selected = (p1[0] <= d.x && d.x <= p2[0] && p1[1] <= d.y && d.y <= p2[1]);
              if (selected) {
                this.selectPoint(d.org);
              } else {
                this.deselectPoint(d.org);
              }
            })
            let ct = 0;
            let pt = null;
            this.pointData.forEach( d => {
              if (d.selected) {
                ct ++;
                pt = d;
              }
            })
            if (ct === 1) {
              pt.lastSelect = true;
            }

            this.update();
          }
          d3.event.on("drag", dragged).on("end", ended);
        }
      })

    let zoomMoved = 0;
    let zoomScale = null;

    this.gridZoomBehavior = d3.zoom()
      .scaleExtent([0.8, 160])
      .filter(() => {
        this.altKey = d3.event.altKey;
        return (!d3.event.shiftKey && !d3.event.altKey);
      })
      .on('start', () => {
        zoomMoved = 0;
        zoomScale = d3.event.transform.k;
      })
      .on('zoom', () => {
        zoomMoved ++;
        if (zoomScale !== d3.event.transform.k) {
          zoomMoved += 10;
        }
        const transform = d3.event.transform;
        if (this.props.onChangeParam) {
          this.params.gridZoom = transform;
          this.props.onChangeParam(this.params);
        }
        this.xScale.range([transform.applyX(0), transform.applyX(this.state.width)]);
        this.clearGrid(this.grid);
        this.updateData();
        this.update();
        this.cursorData.visible = false;
        this.drawCursor();
      })
      .on('end', () => {
        if (zoomMoved < 5) {
          this.pointData.forEach( v => {
            this.deselectPoint(v);
          })
          this.lineData.forEach( v => {
            delete v.selected;
            delete v.lastSelect;
          })
          this.update();
        }
      })
    
    this.base
      .call(this.gridZoomBehavior)
      .on('dblclick.zoom', null)
      .call(this.dragMarky)
      .on("mouseleave", () => {
        this.cursorData.visible = false;
        this.drawCursor();
      })
      .on("mousemove", () => {
        const p = d3.mouse(this.svgElement);
        this.cursorData.x = limitMin(this.xScale.invert(p[0]));
        this.cursorData.y = parseInt(this.yScale.invert(p[1])+0.5);
        this.cursorData.visible = true;
        this.drawCursor();
      })

    this.menuZoomBehavior = d3.zoom()
      .scaleExtent([0.8, 5])
      .filter(() => {
        this.altKey = d3.event.altKey;
        return (!d3.event.shiftKey && !d3.event.altKey);
      })
      .on('start', () => {
        zoomMoved = 0;
        zoomScale = d3.event.transform.k;
      })
      .on('zoom', () => {
        zoomMoved ++;
        if (zoomScale !== d3.event.transform.k) {
          zoomMoved += 10;
        }
        const transform = d3.event.transform;
        if (this.props.onChangeParam) {
          this.params.menuZoom = transform;
          this.props.onChangeParam(this.params);
        }
        this.yScale.range([transform.applyY(0), transform.applyY(this.state.height)]);
        this.clearGrid(this.grid);
        this.clearGrid(this.menu);
        this.update();
        this.cursorData.visible = false;
        this.drawCursor();
      })
      .on('end', () => {
        if (zoomMoved < 5) {
          this.update();
        }
      })

    this.menu
      .call(this.menuZoomBehavior)
      .on('dblclick.zoom', null)

    this.updateData();

    const marky = this.marky;
    marky
      .selectAll('rect')
      .data([this.markyData])
      .enter()
      .append('rect')
      .attr('class', 'marky')
      .attr('visibility', 'hidden')
      .attr('stroke', 'none')
      .attr('stroke-width', 2)

    if (this.params.gridZoom) {
      const t = this.params.gridZoom;
      this.base
        .call(this.gridZoomBehavior.transform, d3.zoomIdentity.translate(t.x, 0).scale(t.k));
    } else {
      this.resetScreenPosition();
    }
    if (this.params.menuZoom) {
      const t = this.params.menuZoom;
      this.menu
        .call(this.menuZoomBehavior.transform, d3.zoomIdentity.translate(0, t.y).scale(t.k));
    }

    this.update();
  }

  updateData = () => {
    const { width, height } = this.size();

    //データの準備
    {
      const convert = (p) => {
        return [this.xScale.invert(p[0]), this.yScale.invert(p[1])];
      }
      const p1 = convert([0, 0]);
      const w = this.xScale.invert(width)-this.xScale.invert(0);

      let min = oneday;
      let max = 0;

      this.pointData.forEach( (p, i) => {
        p.i = i;
        delete p.mark;
        if (!p.time) {
          p.time = Utils.makeTimeText(p);
        }
        if (min > p.x) min = p.x;
        if (max < p.x) max = p.x;
      })

      min = (min < 0) ? (parseInt(min/oneday)-1) : parseInt(min/oneday);
      max = (max < 0) ? (parseInt(max/oneday)-1) : parseInt(max/oneday);

      //表示範囲を計算
      const start24 = (v) => {
        if (v < 0) v = (parseInt(v / oneday)-1)*oneday;
        return parseInt(v / oneday)*oneday;
      }
      const pp = start24(p1[0])-max*oneday;
      const pw = (parseInt(w/oneday)+2)*oneday-min*oneday+max*oneday;

      const s0 = p1[0];
      const s1 = s0+w;
      const a0 = limit24(s0);
      const a1 = limit24(s1);
      const as = start24(s0) === start24(s1);

      this.pointLoopData = [];
      this.lineLoopData = [];
      const pointMarge = {};

      const checkRange = (x, i) => {
        return (x+i >= s0 && x+i <= s1);
      }

      const findPoint = (idx, p, dx) => {
        let rp = null;
        if (typeof pointMarge[idx] === 'undefined') {
          pointMarge[idx] = {};
        }
        rp = pointMarge[idx][p.i];
        if (rp) return rp;
        rp = { ...p };
        rp.dx = dx;
        rp.x = p.x+rp.dx;
        rp.org = p;
        delete rp.time;
        pointMarge[idx][p.i] = rp;
        this.pointLoopData.push(rp);
        return rp;
      }

      this.lineData.forEach( (p, i) => {
        for (var i=pp;i<pp+pw;i+=oneday) {
          if (checkRange(p.s.x, i) || checkRange(p.d.x, i)) {
            p.s.mark = true;
            p.d.mark = true;
            const s = findPoint(i, p.s, i);
            const d = findPoint(i, p.d, i);
            const l = { ...p };
            l.org = p;
            l.i = i;
            l.s = s;
            l.d = d;
            this.lineLoopData.push(l);
          }
        }
      })

      this.pointData.forEach( p => {
        if (!p.mark) {
          for (var i=pp;i<pp+pw;i+=oneday) {
            if (checkRange(p.x, i)) {
              findPoint(i, p, i);
            }
          }
        }
        delete p.mark;
      })
    }
  }

  update = () => {
    const self = this;
    const { width, height } = this.size();

    this.textData = [];
    this.pointLoopData.forEach( (p, i) => {
      p.x = p.org.x+p.dx;
      if (p.org.selected) {
        if (!p.time) {
          p.time = Utils.makeTimeText(p);
        }
        this.textData.push(p.time)
      }
    })

    this.line.selectAll('line.link')
      .data(this.lineLoopData)
      .exit()
      .remove()

    this.line.selectAll('line.link')
      .data(this.lineLoopData)
      .enter()
      .append('line')
      .classed('link', true)
      .attr('fill', 'none')
      .style("pointer-events", "none")
      .attr('stroke-width', 1)

    this.line.selectAll('line.selection')
      .data(this.lineLoopData)
      .exit()
      .remove()

    this.line.selectAll('line.selection')
      .data(this.lineLoopData)
      .enter()
      .append('line')
      .classed('selection', true)
      .attr('fill', 'none')
      .attr('stroke', 'rgb(0,0,0,0)')
      .attr('stroke-width', 6)

    this.rect.selectAll('rect.link')
      .data(this.pointLoopData)
      .exit()
      .remove()

    this.rect.selectAll('rect.link')
      .data(this.pointLoopData)
      .enter()
      .append('rect')
      .classed('link', true)
      .attr('fill', 'rgba(0,0,0,0)')
      .call(this.dragHandle)
      .on('dblclick',(d, i) => {
        console.log(`dbl ${i}`);
      })
      .on('mouseover', (_d, i) => {
        const d = _d.org;
        if (!d.selected) {
          if (!_d.time) {
            _d.time = Utils.makeTimeText(_d);
          }
          if (_d.time) {
            if (this.textData.indexOf(_d.time) < 0) {
              this.textData.push(_d.time)
            }
          }
          this.updateText();
        }
      })
      .on('mouseout', (_d, i) => {
        const d = _d.org;
        if (!d.selected) {
          if (_d.time) {
            this.textData.splice(this.textData.indexOf(_d.time),1);
          }
          this.updateText();
        }
      })

    this.line.selectAll('line.link')
      .attr('x1', d => this.xScale(d.s.x))
      .attr('y1', d => this.yScale(d.s.y))
      .attr('x2', d => this.xScale(d.d.x))
      .attr('y2', d => this.yScale(d.d.y))
      .attr('stroke', d => d.org.selected ? '#F00' : '#999')

    this.line.selectAll('line.selection')
      .attr('x1', d => this.xScale(d.s.x))
      .attr('y1', d => this.yScale(d.s.y))
      .attr('x2', d => this.xScale(d.d.x))
      .attr('y2', d => this.yScale(d.d.y))
      .on('click', (_d, i) => {
        const d = _d.org;
        if (!d3.event.shiftKey) {
          this.pointData.forEach( d => {
            this.deselectPoint(d);
          })
          this.lineData.forEach( d => {
            delete d.selected;
          })
        } else {
          if (d.selected) {
            this.lineData.forEach( l => {
              if (!l.s.lines) l.s.lines = [];
              if (!l.d.lines) l.d.lines = [];
              l.s.lines.push(l);
              l.d.lines.push(l);
            })
            const deepSelect = (l) => {
              if (!l.selected) {
                l.selected = true;
                this.selectPoint(l.s);
                this.selectPoint(l.d);
                l.s.lines.forEach( l => {
                  deepSelect(l);
                })
                l.d.lines.forEach( l => {
                  deepSelect(l);
                })
              }
            }
            delete d.selected;
            deepSelect(d);
            this.pointData.forEach( p => {
              delete p.lines;
            })
          }
        }
        d.selected = true;
        this.update();
      })

    this.rect.selectAll('rect.link')
      .attr('x', d => this.xScale(d.x)-4)
      .attr('y', d => this.yScale(d.y)-4)
      .attr('width', 8)
      .attr('height', 8)
      .attr('fill', d => d.org.lastSelect ? '#FF0000' : '#00000000')
      .attr('stroke', d => d.org.selected ? ( d.org.lastSelect ? '#FF0000' : '#FFA000') : '#999')
      .attr('stroke-width', 1)

    this.updateGrid(this.grid, this.gridRectangles());
    this.updateGrid(this.menu, this.menuRectangles());

    this.updateText();
  }

  updateText = () => {
    this.text.selectAll('text')
      .data(this.textData)
      .exit()
      .remove()

    this.text.selectAll('text')
      .data(this.textData)
      .enter()
      .append('text')
      .style("pointer-events", "none")

    this.text.selectAll('text')
      .each( (d, i) => {
        if (d.update) d.update();
      })
      .attr('fill', (d) => d.color ? d.color : 'black')
      .attr('font-size', d => 18*d.fontSize)
      .attr('x', d => this.xScale(d.x)+d.dx)
      .attr('y', d => this.yScale(d.y)+d.dy)
      .attr('transform',d => d.rotate ? `rotate(${d.rotate},${this.xScale(d.x)},${this.yScale(d.y)})` : '')
      .text(d => d.text )
  }

  updateMarky = () => {
    const marky = this.marky;
    marky
      .selectAll('rect')
      .attr('visibility', d => d.visible ? 'visible' : 'hidden')
      .attr('fill', (d) => d.color ? d.color : 'none')
      .attr('x', d => d.width >= 0 ? d.x : d.x+d.width)
      .attr('y', d => d.height >= 0 ? d.y : d.y+d.height)
      .attr('width', d => d.width >= 0 ?  d.width : -d.width)
      .attr('height', d => d.height >= 0 ?  d.height : -d.height)
  }

  gridRectangles = () => {
    const { width, height } = this.size();
    const convert = (p) => {
      return [this.xScale.invert(p[0]), this.yScale.invert(p[1])];
    }
    const p1 = convert([0, 0]);
    const w = this.xScale.invert(width )-this.xScale.invert(0);
    const h = this.yScale.invert(height)-this.yScale.invert(0);
    const hourw = this.xScale(60*60)-this.xScale(0);

    //矩形
    const r = [];
    //ライン
    const l = [];
    //テキスト
    const t = [];

    r.push({
      color: '#00000000',
      x: p1[0],
      y: p1[1],
      width: w,
      height: h,
    })

    //縦グリッド------------------------------------------------------------------

    const drawTimeLine = (size) => {
      for (var i=0;i<w+size*4;i+=size) {
        const x1 = i+p1[0]-(p1[0]%(size*2))-size*2;
        const y1 = p1[1];
        let idx = parseInt(x1+(x1 > 0 ? 0.5 : -0.5));
        let color = null;
        let text = null;
        let width = 1;
        let fontSize = 0.85;
        let fontColor = '#808080';
        let idd = idx;
        if (idx < 0) idx = -(oneday+idx);
        if ((idx % oneday) == 0) {
          width = 4;
          if (idd === 0 || idd === oneday) {
            color = '#A0A0FF';
          } else {
            color = '#E0E0E0';
          }
          text = Utils.toTime(x1);
          fontSize = 1;
          fontColor = '#404040';
          if (x1 < 0 || x1 >= 24*60*60) {
            fontColor = '#A0A0A0';
          }
        } else
        if ((idx % (60*60)) == 0) {
          width = 2;
          color = '#A0FFFF';
          text = Utils.toTime(x1);
          fontSize = 1;
          fontColor = '#404040';
          if (x1 < 0 || x1 >= 24*60*60) {
            fontColor = '#A0A0A0';
          }
        } else
        if ((idx % (30*60)) == 0) {
          color = '#A0FFFF';
          if (hourw/(this.gridScale.x+5) >= 2) {
            text = Utils.toTime(x1);
          }
        } else
        if ((idx % (15*60)) == 0 && hourw/(this.gridScale.x+5) >= 2) {
          color = '#E0FFFF';
          if (hourw/(this.gridScale.x+5) >= 4) {
            text = Utils.toTime(x1);
          }
        } else
        if ((idx % ( 5*60)) == 0 && hourw/(this.gridScale.x+5) >= 4) {
          color = '#E0FFFF';
          if (hourw/(this.gridScale.x+5) >= 12) {
            text = Utils.toTime(x1);
          }
        } else
        if ((idx % (   60)) == 0 && hourw/(this.gridScale.x+5) >= 12) {
          color = '#E0FFFF';
          if (hourw/(this.gridScale.x+5) >= 60) {
            text = Utils.toTime(x1).slice(-2);
          }
        }
        if (color) {
          l.push({
            x1: this.xScale(x1),
            y1: this.yScale(y1),
            x2: this.xScale(x1),
            y2: this.yScale(y1+h),
            color,
            width,
          });
          if (text) {
            t.push({
              x: x1,
              y: y1,
              dx: 4,
              dy: -3,
              rotate: 90,
              name: text,
              color: fontColor,
              fontSize,
            })
          }
        }
      }
    }
    drawTimeLine(60);

    //バス停ライン------------------------------------------------------------------

    {
      const size = 1;
      for (var i=0;i<h+size*4;i+=size) {
        const x1 = p1[0];
        const y1 = parseInt(i+p1[1]-(p1[1]%(size*2))-size*2+0.5);
        if (y1 >= 1 && y1 <= this.busStops.length) {
          const busStop = this.busStops[y1-1];
          const q = {
            x1: this.xScale(x1),
            y1: this.yScale(y1),
            x2: this.xScale(x1+w),
            y2: this.yScale(y1),
            color: '#80FFFF',
            width: 1,
            //stroke: '2,2',
          }
          if (busStop.selected) {
            q.color = 'red';
          }
          l.push(q);
        }
      }
    }

    return {
      rectData: r,
      lineData: l,
      textData: t,
    };
  }

  menuRectangles = () => {
    const { width, height } = this.size();
    const convert = (p) => {
      return [this.xScale.invert(p[0]), this.yScale.invert(p[1])];
    }
    const p1 = convert([0, 0]);
    const w = this.xScale.invert(width )-this.xScale.invert(0);
    const h = this.yScale.invert(height)-this.yScale.invert(0);
    const menuw = this.xScale.invert(menuWidth)-this.xScale.invert(0);

    //矩形
    const r = [];
    //ライン
    const l = [];
    //テキスト
    const t = [];

    r.push({
      color: '#F8F8F8D0',
      x: p1[0],
      y: p1[1],
      width: menuw,
      height: h,
    })

    l.push({
      color: '#D0D0D0',
      x1: menuWidth,
      y1: 0,
      x2: menuWidth,
      y2: height,
      width: 1,
    })

    //バス停ライン------------------------------------------------------------------

    {
      const size = 1;
      for (var i=0;i<h+size*4;i+=size) {
        const x1 = p1[0];
        const y1 = parseInt(i+p1[1]-(p1[1]%(size*2))-size*2+0.5);
        if (y1 >= 1 && y1 <= this.busStops.length) {
          const busStop = this.busStops[y1-1];
          const q = {
            x1: this.xScale(x1),
            y1: this.yScale(y1),
            x2: this.xScale(x1+menuw),
            y2: this.yScale(y1),
            color: '#80FFFF',
            width: 1,
            //stroke: '2,2',
          }
          if (busStop.selected) {
            q.color = 'red';
          }
          l.push(q);
          const s = {
            x: x1,
            y: y1,
            dx: 4,
            dy: -4,
            name: busStop.name,
            color: '#404040',
            index: y1,
            fontSize: 1,
          }
          if (busStop.selected) {
            s.color = 'red';
          }
          t.push(s);
        }
      }
    }

    return {
      rectData: r,
      lineData: l,
      textData: t,
    };
  }

  clearGrid = (node) => {
    node
      .selectAll('line.stops')
      .remove();

    node
      .selectAll('text.stops')
      .remove();

    node
      .selectAll('rect.stops')
      .remove();
  }

  updateGrid = (node, { rectData, lineData, textData, }) => {
    node
      .selectAll('rect.stops')
      .data(rectData)
      .exit()
      .remove()
    node
      .selectAll('rect.stops')
      .data(rectData)
      .enter()
      .append('rect')
      .classed('stops', true)
      //.style("pointer-events", "none")
      .attr('stroke', 'none')
      .attr('stroke-width', 2)
      .attr('fill', (d) => d.color ? d.color : 'none')
      .attr('x', d => this.xScale(d.x))
      .attr('y', d => this.yScale(d.y))
      .attr('width', d => this.xScale(d.width)-this.xScale(0))
      .attr('height', d => this.yScale(d.height)-this.yScale(0))
    node
      .selectAll('line.stops')
      .data(lineData)
      .exit()
      .remove()
    node
      .selectAll('line.stops')
      .data(lineData)
      .enter()
      .append('line')
      .classed('stops', true)
      .attr('fill', 'rgba(0,0,0,0)')
      .attr('stroke', (d) => d.color ? d.color : 'none')
      .attr('stroke-width', d => d.width)
      .attr('stroke-dasharray', (d) => d.stroke ? d.stroke : 'none')
      .attr('x1', d => d.x1)
      .attr('y1', d => d.y1)
      .attr('x2', d => d.x2)
      .attr('y2', d => d.y2)
      .on('click', function(d, i) {
        //console.log('click 1');
      })
      .on('mouseover', function(d, i) {
        //console.log('mouseover');
      })
    node
      .selectAll('text.stops')
      .data(textData)
      .exit()
      .remove()
    node
      .selectAll('text.stops')
      .data(textData)
      .enter()
      .append('text')
      .classed('stops', true)
      .attr('fill', (d) => d.color ? d.color : 'black')
      .attr('font-size', d => 13*d.fontSize)
      .attr('x', d => this.xScale(d.x)+d.dx)
      .attr('y', d => this.yScale(d.y)+d.dy)
      .attr('text-anchor', 'start')
      .attr('transform',d => d.rotate ? `rotate(${d.rotate},${this.xScale(d.x)},${this.yScale(d.y)})` : '')
      .text(d => d.name == '' ? '名称未設定' : d.name )
      .on('dblclick', (d, i) => {
      })
      .on('click', (d, i) => {
        if (typeof d.index !== 'undefined') {
          const busStop = this.busStops[d.index-1];
          if (busStop.selected) {
            const busStop = this.busStops[d.index-1];
            if (this.props.onEditBusStop) {
              this.props.onEditBusStop({
                name: busStop.name,
                data: this.busStopData(d.index),
                index: d.index,
              });
            }
          } else {
            this.busStops.forEach( b => {
              delete b.selected;
            })
            busStop.selected = true;
            this.clearGrid(this.grid);
            this.clearGrid(this.menu);
            this.updateGrid(this.grid, this.gridRectangles());
            this.updateGrid(this.menu, this.menuRectangles());
          }
        }
      })
      .on('mouseover', function(d, i) {
        if (typeof d.index !== 'undefined') {
          //console.log(`mouseover stop ${d.index}`);
        }
      })
  }

  drawCursor = () => {
    if (!this.props.readOnly) {
      this.cursor.selectAll('rect').remove();
      this.cursor.append('rect')
        .attr('fill', 'none')
        .attr('x', this.xScale(this.cursorData.x)-4)
        .attr('y', this.yScale(this.cursorData.y)-4)
        .attr('visibility', (this.cursorData.visible && this.altKey) ? 'visible' : 'hidden')
        .attr('width', 8)
        .attr('height', 8)
        .attr('stroke-width', 1)
        .attr('stroke', '#999')
        .on('click', function(d, i) {
          //console.log('click ?');
        })
    }
  }

  onKeyDown = (e) => {
    this.altKey = e.altKey;
    // //space key
    // if(e.keyCode === 32) {
    //   e.preventDefault();
    //   if (!this.props.readOnly) {
    //     const b = textDiagramData(Utils.save(this));
    //     this.pointData.forEach( d => {
    //       delete d.lastSelect;
    //     })
    //     const p = {
    //       x: this.cursorData.x,
    //       y: this.cursorData.y,
    //       lastSelect: true,
    //     }
    //     p.time = Utils.makeTimeText(p);
    //     this.selectPoint(p);
    //     this.pointData.push(p)
    //     this.onChange();
    //     this.updateData();
    //     this.update();
    //     this.cursorData.visible = false;
    //     this.drawCursor();
    //     this.setUndo(b);
    //   }
    // }
    //delete key
    if(e.keyCode === 8 || e.keyCode === 46) {
      e.preventDefault();
      if (!this.props.readOnly) {
        let done = false;
        const b = textDiagramData(Utils.save(this));
        this.lineData.forEach( d => {
          if (d.s.selected || d.d.selected) {
            d.selected = true;
          }
        })
        let pointData = [];
        this.pointData.forEach( d => {
          if (!d.selected) {
            pointData.push(d);
          } else {
            done = true;
            if (d.time) {
              this.textData.splice(this.textData.indexOf(d.time),1);
            }
          }
        })
        let lineData = [];
        this.lineData.forEach( d => {
          if (!d.selected) {
            lineData.push(d);
          }
        })
        if (done) this.setUndo(b);
        this.pointData = pointData;
        this.lineData = lineData;
        this.onChange();
        this.updateData();
        this.update();
      }
    }
    //enter key
    if(e.keyCode === 13) {
      e.preventDefault();
      if (!this.props.readOnly) {
        const b = textDiagramData(Utils.save(this));
        let selectedBusStop = 0;
        this.busStops.some( (b, i) => {
          if (!b.selected) return false;
          selectedBusStop = i+1;
          return true;
        })
        if (selectedBusStop >= 1
        && selectedBusStop <= this.busStops.length) {
          if (e.shiftKey) {
            if (this.busStops.length <= 2 || selectedBusStop < 2) return;
            Utils.deleteBusstop(this, selectedBusStop-2);
            this.setUndo(b);
          } else {
            Utils.insertBusstop(this, selectedBusStop-1);
            this.setUndo(b);
          }
          this.onChange();
          this.updateData();
          this.clearGrid(this.grid);
          this.clearGrid(this.menu);
          this.update();
        }
      }
    }
    //left key 
    if(e.keyCode === 37) {
      e.preventDefault();
    }
    //right key 
    if(e.keyCode === 39) {
      e.preventDefault();
    }
    //command+z
    if(e.metaKey && e.keyCode === 90) {
      e.preventDefault();
      if (!this.props.readOnly) {
        if (e.shiftKey) {
          this.doRedo();
        } else {
          this.doUndo();
        }
      }
    }
  }

  onKeyUp = (e) => {
    if (!this.props.readOnly) {
      this.altKey = e.altKey;
    }
  }

  onMouseLeave = (event) => {
    if (event.shiftKey) {
      this.marky.width = 0;
      this.marky.height = 0;
    }
  }

  onChange = () => {
    const b = Utils.save(this);
    if (this.props.onChangeData) {
      this.props.onChangeData(b);
    }
  }

  setUndo = (b) => {
    this.undoBuffer = this.undoBuffer.slice(0, this.undoPtr);
    this.undoBuffer.push(b);
    this.undoPtr ++;
  }

  doUndo = () => {
    if (this.undoPtr > 0) {
      this.undoPtr--;
      const b = this.undoBuffer[this.undoPtr];
      this.loadData(b);
      if (this.props.onChangeData) {
        this.props.onChangeData(b);
      }
    }
  }

  doRedo = () => {
    if (this.undoBuffer.length > this.undoPtr) {
      const b = this.undoBuffer[this.undoPtr];
      this.loadData(b);
      if (this.props.onChangeData) {
        this.props.onChangeData(b);
      }
      this.undoPtr++;
    }
  }

  get diagramData() {
    const t = Utils.save(this);
console.log(t);
    return textDiagramData(t);
  }

  busStopData(stopNo) {
    const r = [];
    const busStop = this.busStops[stopNo-1];
    const name = busStop.name;
    this.pointData.forEach( (p, i) => {
      p.idx = i;
      delete p.mark;
      delete p.lines;
    })
    this.lineData.forEach( l => {
      if (typeof l.s.lines === 'undefined') l.s.lines = [];
      if (typeof l.d.lines === 'undefined') l.d.lines = [];
      l.s.lines.push(l);
      l.d.lines.push(l);
    })
    this.pointData.forEach( p => {
      if (p.y === stopNo) {
        r.push(p);
      }
    })
    const findLinkedTime = (p, t, o, s) => {
      if (p.mark) return;
      if (o.y === p.y) s.push(p);
      t.push(p);
      p.mark = true;
      p.lines.forEach( l => {
        findLinkedTime(l.s, t, o, s);
        findLinkedTime(l.d, t, o, s);
      })
    }
    const rp = [];
    const times = r.map( p => {
      const t = [];
      const s = [];
      findLinkedTime(p, t, p, s);
      if (t.length > 1) {
        t.sort( (a,b) => {
          if (a.y > b.y) return  1;
          if (a.y < b.y) return -1;
          return 0;
        })
        const fp = t[0];
        const ep = t[t.length-1];
        s.sort( (a,b) => {
          if (a.x > b.x) return  1;
          if (a.x < b.x) return -1;
          return 0;
        })
        let q =  { ...s[s.length-1] };
        if (fp.x < ep.x) {
          q.dir = 'down';
          q.departure = this.busStops[fp.y-1];
          q.arrival = this.busStops[ep.y-1];
        } else {
          q.dir = 'up';
          q.departure = this.busStops[ep.y-1];
          q.arrival = this.busStops[fp.y-1];
        }
        q.x = limit24(q.x);
        let g = parseInt(q.x+0.5);
        q.sec = parseInt(g % 60);
        q.min = parseInt(g / 60) % 60;
        q.hour = parseInt(parseInt(g / 60) / 60);
        return q;
      }
      return null;
    })
    .filter( p => p !== null )
    .sort( (a,b) => {
      if (a.x > b.x) return  1;
      if (a.x < b.x) return -1;
      return 0;
    });
    this.pointData.forEach( p => {
      delete p.idx;
      delete p.mark;
      delete p.lines;
    })
    return {
      name,
      times,
    }
  }

  resetScreenPosition = () => {
    const { width, height } = this.size();

    this.xScale
      .domain([0, width*this.timeLineWidth()])
      .range([0, width]);

    const w = (width - menuWidth)/(this.gridScale.x*24);

    this.base
      .call(this.gridZoomBehavior.transform, d3.zoomIdentity.translate(this.gridScale.x*(menuWidth/this.gridScale.x), 0).scale(w));

    this.menu
      .call(this.menuZoomBehavior.transform, d3.zoomIdentity.translate(0, 0).scale(1));
  }

  changeBusStop = (busStop) => {
    if (!this.props.readOnly) {
      const i = busStop.index-1;
      if (i >= 0 && i < this.busStops.length) {
        const name = busStop.name.trim().replace(/\s/g, '');
        if (this.busStops[i].name !== name) {
          const b = textDiagramData(Utils.save(this));
          this.busStops[i].name = name;
          this.onChange();
          this.setUndo(b);
        }
      }
    }
  }

  render() {
    return (
      <div
        ref={n => this.container = n}
        style={{
          display: 'inline-block',
          marign: 0,
          padding: 0,
          width: this.state.width,
          overflow: 'hidden',
          border: 'solid 1px lightgray',
        }}
        tabIndex={this.props.tabIndex}
        focusable={true}
        onKeyDown={this.onKeyDown}
        onKeyUp={this.onKeyUp}
        onMouseLeave={this.onMouseLeave}
      >
        <svg
          ref={n => {
            this.svgElement = n;
            this.svg = d3.select(n)
          }}
          width="100%"
          height={this.state.height}
          style={{
            marign: 0,
          }}
        >
          <g ref={n => this.base = d3.select(n)} >
            <g ref={n => this.axis = d3.select(n)} style={{ visibility: 'hidden' }}/>
            <g ref={n => this.grid = d3.select(n)} />
            <g ref={n => this.line = d3.select(n)} />
            <g ref={n => this.rect = d3.select(n)} />
            <g ref={n => this.cursor = d3.select(n)} />
            <g ref={n => this.text = d3.select(n)} />
            <g ref={n => this.marky = d3.select(n)} />
          </g>
          <g ref={n => this.menu = d3.select(n)} />
        </svg>
      </div>
    )
  }
}

DiagramView.defaultProps = {
  params: {},
  readOnly: false,
  tabIndex: 0,
}
