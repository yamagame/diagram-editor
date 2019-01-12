import React, { Component } from 'react';
import DiagramView from '../../components/DiagramView';
import BusStopDialog from '../../components/BusStopDialog';
import DiagramDataDialog from '../../components/DiagramDataDialog';
import ConfigDialog from '../../components/ConfigDialog';
import {
  Nav,
} from 'react-bootstrap';
import 'whatwg-fetch'

const namespace = 'diagram';

const api = 'https://api-tokyochallenge.odpt.org/api/v4';

const BusTimetableAPI = 'BusTimetable';
const BusstopPoleAPI = 'BusstopPole';
const BusroutePatternAPI = 'BusroutePattern';

const AsyncStorage = {
  getItem: function(key, defaultValue) {
    const value = localStorage.getItem(`${namespace}-${key}`);
    return (value !== null) ? JSON.parse(value).data : defaultValue;
  },
  setItem: function(key, value) {
    localStorage.setItem(`${namespace}-${key}`, JSON.stringify({ data: value }));
  },
}

export default class Diagram extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showBusStopDialog: false,
      showDiagramDataDialog: false,
      showConfigDialog: false,
      busStop: {
        name: '',
        data: {},
      },
      params: AsyncStorage.getItem('params', {}),
      width: window.innerWidth,
      height: window.innerHeight,
      diagramData: AsyncStorage.getItem('data', ''),
      diagramEditData: '',
      busRouteTable: AsyncStorage.getItem('busRouteTable', {}),
      consumerKey: AsyncStorage.getItem('consumerKey', ''),
      operator: AsyncStorage.getItem('operator', { title: '', key: '', }),
      loading: '',
      selectedRoute: AsyncStorage.getItem('selectedRoute', 0),
    }
  }

  onResize = () => {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
    }, this.update);
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize, false);
    this.loadOpenData();
  }
  
  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  onEditBusStop = (busStop) => {
    this.setState({
      showBusStopDialog: true,
      busStop,
    });
  }

  onCloseBusStop = () => {
    this.setState({
      showBusStopDialog: false,
    })
  }

  onEditedBusStop = (busStop) => {
    this.diagramView.changeBusStop({
      ...this.state.busStop,
      name: busStop.name,
    })
    this.setState({
      showBusStopDialog: false,
    });
  }

  openDiagramDataDialog = () => {
    this.setState({
      showDiagramDataDialog: true,
      diagramEditData: this.diagramView.diagramData,
    });
  }

  onEditedDiagramData = (diagramData) => {
    this.setState({
      showDiagramDataDialog: false,
      diagramData,
    }, () => {
      AsyncStorage.setItem('data', diagramData)
    });
  }

  onCloseDiagramData = () => {
    this.setState({
      showDiagramDataDialog: false,
    })
  }

  onChangeData = (data) => {
    AsyncStorage.setItem('data', this.diagramView.diagramData);
  }

  onChangeParam = (params) => {
    AsyncStorage.setItem('params', params);
  }

  resetScreenPosition = () => {
    this.diagramView.resetScreenPosition();
  }

  openConfigDialog = () => {
    this.setState({
      showConfigDialog: true,
    })
  }

  onCloseConfigDialog = () => {
    this.setState({
      showConfigDialog: false,
    })
  }

  onEditedConfigDialog = ({ consumerKey, operator, }) => {
    AsyncStorage.setItem('consumerKey', consumerKey);
    AsyncStorage.setItem('operator', operator);
    const busRouteTable = { ...this.state.operator.key };
    if (this.state.operator.key) {
      delete busRouteTable[this.state.operator.key];
    }
    this.setState({
      showConfigDialog: false,
      consumerKey,
      operator,
      busRouteTable,
    }, this.loadOpenData)
  }

  loadJSON = (command) => {
    return new Promise( resolve => {
      fetch(`${api}/odpt:${command}?odpt:operator=odpt.Operator:${this.state.operator.key}&acl:consumerKey=${this.state.consumerKey}`)
        .then(function(response) {
          return response.json()
        }).then(function(json) {
          resolve(json);
        }).catch(function(ex) {
          console.log('parsing failed', ex)
        })
    })
  }

  loadOpenData = async () => {
    if (this.state.consumerKey === '') return;
    if (this.state.operator.key === '') return;

    if (this.state.busRouteTable[this.state.operator.key]) return;

    this.setState({ loading: '読み込み中...' });

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

    const routeTable = {};

    Object.keys(busroutes).forEach( k => {
      busroutes[k].route.forEach( v => {
        routeTable[`${busroutes[k].title} ${v.note}`] = {
          title: `${busroutes[k].title} ${v.note ? v.note : ''}`,
          busStops: `${v.order.map( v => v.title ).map( v => v.replace(/\s/g,'')).join(' ')}`,
          times: `${v.times.map( t => t.map( t => t.time ).join(' ')).join('\n')}`,
        }
      })
    })

    const table = { ...this.state.busRouteTable }
    table[this.state.operator.key] = Object.keys(routeTable).map( k => routeTable[k] );

    const busRouteTable = table[this.state.operator.key];
    const diagramData = (busRouteTable.length <= 0) ? '' : `${busRouteTable[0].busStops}\n${busRouteTable[0].times}`;

    this.setState({
      selectedRoute: 0,
      busRouteTable: table,
      loading: '',
      diagramData,
    }, () => {
      AsyncStorage.setItem('busRouteTable', this.state.busRouteTable);
      AsyncStorage.setItem('data', this.state.diagramData)
      AsyncStorage.setItem('selectedRoute', this.state.selectedRoute)
    })

  }

  onSelectRoute = (e) => {
    const i = e.target.value;
    const busRouteTable = this.state.busRouteTable[this.state.operator.key];
    this.setState({
      selectedRoute: i,
      diagramData: `${busRouteTable[i].busStops}\n${busRouteTable[i].times}`,
    }, () => {
      AsyncStorage.setItem('data', this.state.diagramData)
      AsyncStorage.setItem('selectedRoute', this.state.selectedRoute)
    })
  }

  render() {
    return (
      <div style={{ overflow: 'hidden' }}>
        <nav className="navbar sticky-top navbar-light bg-light">
          <a className="navbar-brand" href="#">ダイアグラムエディタ</a>
          {
            this.state.loading ? <Nav className="mr-auto"><span style={{ color: 'red', }}> { this.state.loading } </span></Nav> : null
          }
          {
            (this.state.busRouteTable[this.state.operator.key] && this.state.busRouteTable[this.state.operator.key].length > 0) ? <Nav className="mr-auto">
            <select defaultValue={this.state.selectedRoute} onChange={ this.onSelectRoute }>
              {
                this.state.busRouteTable[this.state.operator.key].map( (r, i) => {
                  return <option key={i} value={i} >{r.title}</option>
                })
              }
            </select></Nav> : null
          }
          <div>
            <a
              href="https://docs.google.com/presentation/d/1F0RfbHgcRPHgPSxpe61pBMZ8Yf0WGaXe7XT06Y3AWkk/edit?usp=sharing"
              target="manual"
              className="btn btn-sm btn-outline-secondary"
              style={{marginRight: 10}}
              role="button"
            >使い方</a>
            <button
              className="btn btn-sm btn-outline-secondary"
              style={{marginRight: 10}}
              type="button"
              onClick={this.openConfigDialog}
            >読み込み</button>
            <button
              className="btn btn-sm btn-outline-secondary"
              style={{marginRight: 10}}
              type="button"
              onClick={this.resetScreenPosition}
            >初期位置</button>
            <button
              className="btn btn-sm btn-outline-secondary"
              type="button"
              onClick={this.openDiagramDataDialog}
            >データ</button>
          </div>
        </nav>
        <DiagramView
          ref={n => this.diagramView = n}
          onEditBusStop={this.onEditBusStop}
          onChangeData={this.onChangeData}
          onChangeParam={this.onChangeParam}
          diagramData={this.state.diagramData}
          params={this.state.params}
          width={this.state.width-2}
          height={this.state.height-26-38-10}
        />
        <BusStopDialog
          busStop={this.state.busStop}
          show={this.state.showBusStopDialog}
          onClose={this.onCloseBusStop}
          onEdited={this.onEditedBusStop}
        />
        <DiagramDataDialog
          show={this.state.showDiagramDataDialog}
          text={this.state.diagramEditData}
          onClose={this.onCloseDiagramData}
          onEdited={this.onEditedDiagramData}
          height={this.state.height-240}
        />
        <ConfigDialog
          show={this.state.showConfigDialog}
          consumerKey={this.state.consumerKey}
          operator={this.state.operator}
          operators={[
            { title: '京王バス', key: 'KeioBus', },
            { title: 'JRバス関東', key: 'JRBusKanto', },
            { title: '関東バス', key: 'KantoBus', },
            { title: '小田急バス', key: 'OdakyuBus', },
            { title: '西東京バス', key: 'NishiTokyoBus', },
            { title: '西武バス', key: 'SeibuBus', },
            { title: '東部バス', key: 'TobuBus', },
            { title: '東急バス',  key: 'TokyuBus', },
          ]}
          onClose={this.onCloseConfigDialog}
          onEdited={this.onEditedConfigDialog}
        />
      </div>
    )
  }
}

Diagram.defaultProps = {
}
