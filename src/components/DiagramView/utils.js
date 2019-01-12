export const oneday = 24*60*60;

export const abs = v => v > 0 ? v : -v;
export const sgn = v => v > 0 ? 1 : -1;

export const limit24 = (v) => {
  if (v < 0) v += oneday;
  return v % oneday;
}

export const toXPoint = (time, pretime) => {
  const p = time.trim().split(':');
  let hour = 0;
  let mint = 0;
  let secd = 0;
  if (p.length > 0) {
    hour = parseInt(p[0]);
  }
  if (p.length > 1) {
    mint = parseInt(p[1]);
  }
  if (p.length > 2) {
    secd = parseInt(p[2]);
  }
  let x = hour*60*60+mint*60+secd;
  let t = x;
  if (pretime !== null) {
    let d = (pretime % oneday) - (x % oneday);
    if (abs(d) >= oneday/2) {
      t += sgn(d)*oneday;
    }
    if (pretime >= oneday) {
      t += parseInt(pretime/oneday)*oneday;
    } else
    if (pretime < 0) {
      t += parseInt(pretime/oneday)*oneday;
    }
  }
  return { t, x };
}

export const toTime = (x) => {
  while (x < 0) x += 24*60*60;
  while (x >= 24*60*60) x -= 24*60*60;
  let t = parseInt(x+0.5);
  const secd = parseInt(t % 60);
  const mint = parseInt(t / 60) % 60;
  const hour = parseInt(parseInt(t / 60) / 60);
  const format = (v) => {
    return `${('00'+v).slice(-2)}`;
  }
  if (secd !== 0) {
    return `${format(hour)}:${format(mint)}:${format(secd)}`;
  }
  return `${format(hour)}:${format(mint)}`;
}

export const makeTimeText = (d) => {
  let t = {
    update: function() {
      this.x = d.x;
      this.y = d.y;
      this.text = toTime(d.x);
      this.dx = 6;
      this.dy = 5;
      this.fontSize = 0.7;
    }
  }
  t.update();
  return t;
}

export const load = ({ busStops, timeLines, }) => {
  const b = busStops.split('\n').map( v => v === '-' ? '' : v );
  const t = timeLines.split('\n');
  const pointData = [];
  const lineData = [];
  t.forEach( v => {
    const t = v.split(' ');
    const r = [];
    let idx = 0;
    let pre = null;
    t.forEach( (q, i) => {
      if (q !== '-' && q !== '') {
        const p = q.split('-');
        p.forEach( v => {
          const { t, x } = toXPoint(v, pre);
          const w = { x: t , y: idx+1 };
          w.time = makeTimeText(w);
          pointData.push(w);
          r.push(w)
          pre = t;
        })
      }
      idx ++;
    })
    let s = null;
    r.forEach( d => {
      if (s) {
        lineData.push({ s, d, });
      }
      s = d;
    })
  })
  if (b.length < 2) {
    while (b.length < 2) b.push('');
  }
  return {
    busStops: b.map( v => { return { name: v } } ),
    pointData,
    lineData,
  }
}

export const save = ({ busStops, pointData, lineData }) => {
  const stops = busStops.map( v => {
    return v.name.trim().replace(/\s/g, '');
  });
  const p = pointData.sort( (a, b) => {
    if (a.x > b.x) return  1;
    if (a.x < b.x) return -1;
    return 0;
  }).map( (d, i) => {
    d.index = i;
    d.lines = [];
    return d;
  })
  const l = lineData.map( v => {
    if (v.s.x > v.d.x) {
      const d = v.s;
      v.s = v.d;
      v.d = d;
    }
    v.done = false;
    v.s.lines.push(v);
    v.d.lines.push(v);
    return v;
  }).sort( (a, b) => {
    if (a.s.x > b.s.x) return  1;
    if (a.s.x < b.s.x) return -1;
    return 0;
  })

  let n = 0;
  const check = (l, i) => {
    if (l.done) return;
    l.done = true;
    if (i < 0) {
      i = n;
      n ++;
    }
    l.index = i;
    l.s.lines.forEach( p => {
      check(p, i);
    })
    l.d.lines.forEach( p => {
      check(p, i);
    })
  }
  l.forEach( (p, i) => {
    check(p, -1);
  })

  let result = [];
  l.sort( (a, b) => {
    if (a.index > b.index) return  1;
    if (a.index < b.index) return -1;
    return 0;
  }).forEach( l => {
    if (typeof result[l.index] == 'undefined') {
      result[l.index] = [];
    }
    result[l.index].push(l);
  })

  let timeLines = [];
  result.forEach( line => {
    const l = line.sort( (a, b) => {
      if (a.s.y > b.s.y) return  1;
      if (a.s.y < b.s.y) return -1;
      return 0;
    })
    let up = false;
    if (l[0].s.y < l[0].d.y) up = true;
    let t = [];
    let q = null;
    l.forEach( (p, i) => {
      if (up) {
        t.push(p.s)
      } else {
        t.push(p.d)
      }
      q = p;
    })
    if (q) {
      if (up) {
        t.push(q.d)
      } else {
        t.push(q.s)
      }
    }
    const u = [];
    stops.forEach( v => {
      u.push([]);
    })
    t.forEach( v => {
      if (v.y > 0 && v.y <= u.length) {
        u[v.y-1].push(v);
      }
    })
    timeLines.push(u.map( p => {
      if (p.length === 0) return '-';
      let t = '';
      p.forEach( v => {
        if (t !== '') t += '-';
        t += toTime(v.x)
      })
      return t;
    }).join(' '));
  })

  // console.log(timeLines);

  return {
    busStops: stops.map( v=> v === '' ? '-' : v ).join('\n'),
    timeLines,
  }
}

export const insertBusstop = ({ busStops, pointData, lineData }, pos) => {
  busStops.splice(pos, 0, { name: '', });
  pointData.forEach( v => {
    if (v.y >= pos+1) {
      v.y += 1;
    }
  })
}

export const deleteBusstop = ({ busStops, pointData, lineData }, pos) => {
console.log(busStops[pos].name);
  if (busStops[pos].name !== '') return;
  busStops.splice(pos, 1);
  const delPos = [];
  pointData.forEach( (v, i) => {
    if (v.y == pos+1) {
      v.delete = true;
      delPos.push(i);
    } else
    if (v.y > pos+1) {
      v.y -= 1;
    }
  })
  delPos.reverse().forEach( v => {
    pointData.splice(v, 1);
  })
  const delLine = [];
  lineData.forEach( (v, i) => {
    if (v.s.delete || v.d.delete) {
      delLine.push(i);
    }
  })
  delLine.reverse().forEach( v => {
    lineData.splice(v, 1);
  })
}
