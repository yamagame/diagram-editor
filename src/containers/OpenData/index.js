import React, { Component } from 'react';
import 'whatwg-fetch'

const api = 'https://api-tokyochallenge.odpt.org/api/v4';

const BusTimetableAPI = 'BusTimetable';
const BusstopPoleAPI = 'BusstopPole';
const BusroutePatternAPI = 'BusroutePattern';

export default class OpenData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      consumerKey: '',
      operator: 'KantoBus',
      busRouteTable: [],
    }
  }

  loadJSON = async (command) => {
    return new Promise( resolve => {
      fetch(`${api}/odpt:${command}?odpt:operator=odpt.Operator:${this.state.operator}&acl:consumerKey=${this.state.consumerKey}`)
        .then(function(response) {
          return response.json()
        }).then(function(json) {
          console.log('parsed json', json)
          resolve(json);
        }).catch(function(ex) {
          console.log('parsing failed', ex)
        })
    })
  }

  load = async () => {
    const BusstopPole = await this.loadJSON(BusstopPoleAPI);
    const BusroutePattern = await this.loadJSON(BusroutePatternAPI);
    const BusTimetable = await this.loadJSON(BusTimetableAPI);

    const route = BusroutePattern;

    const pole = (() => {
      const pole = BusstopPole;
      const pl = {}
      pole.forEach( p => {
        pl[p['owl:sameAs']] = p;
      })
      return pl;
    })();

    const times = (() => {
      const times = BusTimetable;
      const tm = {};
      times.forEach( t => {
        const pattern = t['odpt:busroutePattern'];
        if (tm[pattern] == null) {
          tm[pattern] = [];
        }
        tm[pattern].push(t);
      })
      return tm;
    })();

    function matchBusroute(s) {
      const t = s.match(/^odpt\.Busroute:(.+)/)
      if (t) {
        return t[1];
      }
      return s;
    }

    function matchBuspole(s) {
      const t = s.match(/^odpt\.BusstopPole:(.+)/)
      if (t) {
        return t[1];
      }
      return s;
    }

    function poleInfo(order) {
      return order.map( o => {
        const pl = pole[o['odpt:busstopPole']];
        if (pl) {
          o.title = pl['dc:title'];
        } else {
          o.title = matchBuspole(o['odpt:busstopPole']);
        }
        o['pole'] = matchBuspole(o['odpt:busstopPole']);
        delete o['odpt:busstopPole'];
        return o;
      })
    }

    const busroutes = {};

    route.forEach( r => {
      const br = matchBusroute(r['odpt:busroute']);
      if (busroutes[br] == null) {
        busroutes[br] = {
          title: r['dc:title'],
          route:[],
        };
      }
      const d = {
        note: r['odpt:note'],
        direction: r['odpt:direction'],
        pattern: r['odpt:pattern'],
        order: poleInfo(r['odpt:busstopPoleOrder']),
        route: matchBusroute(r['odpt:busroute']),
      }
      const busroutePattern = `odpt.BusroutePattern:${d.route}.${d.pattern}.${d.direction}`;
      const t = times[busroutePattern]
      if (t) {
        const times = t.map( q => {
          const t = q['odpt:busTimetableObject'].map( t => {
            const d = t['odpt:departureTime'];
            if (d) return {
              pole: matchBuspole(t['odpt:busstopPole']),
              time: d,
            }
            return {
              pole: matchBuspole(t['odpt:busstopPole']),
              time: t['odpt:arrivalTime'],
            }
          })
          return t;
        });
        function reorder(times, order) {
          const t = times.map( time => {
            const q = [];
            let n = -1;
            time.forEach( (t, i) => {
              while (n < order.length) {
                n ++;
                if (order[n].pole === t.pole) {
                  q.push(t)
                  break;
                } else {
                  q.push({ pole: t.pole, time: '-' })
                }
              }
            })
            return q;
          })
          return t;
        }
        const order = d.order;
        d.times = reorder(times, order);
        if (times.length > 0) {
          busroutes[br].route.push(d)
        }
      }
    })

    //console.log(JSON.stringify(busroutes, null, '  '));

    const busRouteTable = {};

    Object.keys(busroutes).forEach( k => {
      busroutes[k].route.forEach( v => {
        busRouteTable[`${busroutes[k].title} ${v.note}`] = {
          title: `${busroutes[k].title} ${v.note}`,
          busStops: `${v.order.map( v => v.title ).map( v => v.replace(/\s/g,'')).join(' ')}`,
          times: `${v.times.map( t => t.map( t => t.time ).join(' ')).join('\n')}`,
        }
      })
    })

    this.setState({
      busRouteTable: Object.keys(busRouteTable).map( k => busRouteTable[k] ),
    })

  }

  onClickHandler = (i) => {
    return () => {
      console.log(this.state.busRouteTable[i]);
    }
  }

  render() {
    return (
      <div style={{ overflow: 'hidden' }}>
        <nav className="navbar sticky-top navbar-light bg-light">
          <a className="navbar-brand" href="#">東京公共交通オープンデータチャレンジ</a>
          <div>
          </div>
        </nav>
        <input
          type="text"
          style={{ width: '100%', marginBottom: 10, }}
          value={this.state.consumerKey}
          onChange={(e) => {
            this.setState({
              consumerKey: e.target.value,
            })
          }}
        />
        <button onClick={this.load} >読み込み</button>
        {
          this.state.busRouteTable.map( (t, i) => {
            return (
              <p key={i} onClick={this.onClickHandler(i)} > {t.title} </p>
            )
          })
        }
      </div>
    )
  }
}

OpenData.defaultProps = {
}
