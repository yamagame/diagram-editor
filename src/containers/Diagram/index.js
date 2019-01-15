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

const CalendarData = [
  { title: '平日:Weekday', key: 'odpt.Calendar:Weekday', },
  { title: '土曜:Saturday', key: 'odpt.Calendar:Saturday', },
  { title: '休日:Holiday', key: 'odpt.Calendar:Holiday', },
];

const AsyncStorage = {
  getItem: function(key, defaultValue) {
    const value = localStorage.getItem(`${namespace}-${key}`);
    return (value !== null) ? JSON.parse(value).data : defaultValue;
  },
  setItem: function(key, value) {
    localStorage.setItem(`${namespace}-${key}`, JSON.stringify({ data: value }));
  },
}

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

function matchCalendar(s) {
  const t = s.match(/^odpt\.Calendar:(.+)/)
  if (t) {
    return t[1];
  }
  return s;
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
      diagramData: AsyncStorage.getItem('diagramData', ''),
      diagramEditData: '',
      busstopPole: AsyncStorage.getItem('busstopPole', []),
      busroutePattern: AsyncStorage.getItem('busroutePattern', []),
      busTimetable: AsyncStorage.getItem('busTimetable', []),
      busRouteTable: AsyncStorage.getItem('busRouteTable', []),
      consumerKey: AsyncStorage.getItem('consumerKey', ''),
      operator: AsyncStorage.getItem('operator', { title: '', key: '', }),
      loading: '',
      selectedRoute: AsyncStorage.getItem('selectedRoute', 0),
      selectedCalendar: AsyncStorage.getItem('selectedCalendar', 0),
      calendarData: AsyncStorage.getItem('calendarData', CalendarData),
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
      AsyncStorage.setItem('diagramData', diagramData)
    });
  }

  onCloseDiagramData = () => {
    this.setState({
      showDiagramDataDialog: false,
    })
  }

  onChangeData = (data) => {
    AsyncStorage.setItem('diagramData', this.diagramView.diagramData);
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
      busstopPole: [],
      busroutePattern: [],
      busTimetable: [],
      showConfigDialog: false,
      consumerKey,
      operator,
      busRouteTable,
      diagramData: '',
    }, () => {
      AsyncStorage.setItem('busstopPole', this.state.busstopPole);
      AsyncStorage.setItem('busroutePattern', this.state.busroutePattern);
      AsyncStorage.setItem('busTimetable', this.state.busTimetable);
      AsyncStorage.setItem('diagramData', this.state.diagramData)
      AsyncStorage.setItem('selectedRoute', this.state.selectedRoute)
      this.loadOpenData();
    })
  }

  loadJSON = async (command, params={}) => {
    return new Promise( resolve => {
      const t = { ...params };
      t['odpt:operator'] = `odpt.Operator:${this.state.operator.key}`;
      t['acl:consumerKey'] = this.state.consumerKey;
      const p = Object.keys(t).map( k => `${k}=${t[k]}`).join('&');
      fetch(`${api}/odpt:${command}?${p}`)
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
    if (this.state.busstopPole.length > 0) return;

    this.setState({ loading: '読み込み中...' });

    let busstopPole = await this.loadJSON(BusstopPoleAPI);
    let busroutePattern = await this.loadJSON(BusroutePatternAPI);

    const busroutes = {};
    const routeTable = {};

    const days = {
      Weekday: '平日',
      Saturday: '土曜',
      Holiday: '休日',
    }

    busroutePattern = busroutePattern.map( r => {
      if (typeof r['odpt:note'] === 'undefined') {
        r.title = `${r['dc:title']}`;
      } else {
        r.title = `${r['dc:title']}:${r['odpt:note']}`;
      }
      return r;
    }).sort((a,b) => {
      if (a.title > b.title) return -1;
      if (a.title < b.title) return  1;
      return 0;
    })

    this.setState({
      busstopPole,
      busroutePattern,
      busTimetable: [],
      selectedRoute: 0,
      loading: '',
      diagramData: '',
    }, async () => {
      await this.loadTimetable();
      AsyncStorage.setItem('busstopPole', this.state.busstopPole);
      AsyncStorage.setItem('busroutePattern', this.state.busroutePattern);
      AsyncStorage.setItem('busTimetable', this.state.busTimetable);
      AsyncStorage.setItem('diagramData', this.state.diagramData)
      AsyncStorage.setItem('selectedRoute', this.state.selectedRoute)
    })
  }

  loadTimetable = async () => {
    const { busstopPole } = this.state;
    const busRoute = this.state.busroutePattern[this.state.selectedRoute];
    let busTimetable;
    if (this.state.busTimetable.length <= 0) {
      this.setState({ loading: '読み込み中...' });
      const params = {}
      params['odpt:busroutePattern'] = busRoute['owl:sameAs'];
      busTimetable = await this.loadJSON(BusTimetableAPI, params);
    } else {
      busTimetable = [ ...this.state.busTimetable ];
    }
    let calendars = {};
    let calendarData = [ ...CalendarData ];
    busTimetable.forEach( t => {
      const cal = t['odpt:calendar'];
      const c = matchCalendar(cal);
      if (!CalendarData.some( t => {
        return (t.key === cal);
      })) {
        if (!calendars[t['odpt:calendar']]) {
          calendars[t['odpt:calendar']] = c;
          calendarData.push({ title: c, key: t['odpt:calendar'] });
        }
      }
    })
    let selectedCalendar = calendarData.length > this.state.selectedCalendar ? this.state.selectedCalendar : 0;
    let timeTable = busTimetable.filter( t => {
      return (t['odpt:calendar'] === calendarData[selectedCalendar].key);
    })
    let poleOrder = busRoute['odpt:busstopPoleOrder'];

    function reorder(times, order) {
      const t = times.map( time => {
        const q = [];
        let n = -1;
        time['odpt:busTimetableObject'].forEach( (t, i) => {
          while (n < order.length) {
            n ++;
            if (order[n]['odpt:busstopPole'] === t['odpt:busstopPole']) {
              q.push(t)
              break;
            } else {
              q.push({ 'odpt:busstopPole': order[n]['odpt:busstopPole'], 'odpt:departureTime': '-' })
            }
          }
        })
        return q;
      })
      return t;
    }
    timeTable = reorder(timeTable, poleOrder);
    if (busRoute['odpt:direction'] === '2') {
      poleOrder = [ ...poleOrder ].reverse();
      timeTable = [ ...timeTable.map( t => [ ...t ].reverse() ) ];
    } else {
      poleOrder = [ ...poleOrder ]
      timeTable = [ ...timeTable.map( t => [ ...t ] ) ]
    }

    this.setState({
      busTimetable,
    }, () => {
      AsyncStorage.setItem('busTimetable', this.state.busTimetable)
    })

    const missingPole = [];

    const findName = () => {
      const poleTable = {};
      busstopPole.forEach( p => {
        poleTable[p['owl:sameAs']] = p;
      })
      return poleOrder.map( p => {
        function poleName(p) {
          const pole = poleTable[p];
          if (pole && typeof pole['dc:title'] !== 'undefined') {
            if (typeof pole['odpt:busstopPoleNumber'] !== 'undefined') {
              return `${pole['dc:title']}(${pole['odpt:busstopPoleNumber']})`;
            } else {
              return pole['dc:title'];
            }
          } else {
            missingPole.push(p)
            return p;
          }
        }
        return poleName(p['odpt:busstopPole']);
      });
    }

    let poleNames = findName();

    if (missingPole.length > 0) {
      this.setState({ loading: '読み込み中...' });
    }

    for (var i=0;i<missingPole.length;i++) {
      const params = {}
      params['owl:sameAs'] = missingPole[i];
      const pole = await this.loadJSON(BusstopPoleAPI, params);
      if (pole) {
        busstopPole.push(pole[0]);
      }
    }

    this.setState({ loading: '' });

    if (missingPole.length > 0) {
      poleNames = findName();
    }

    const times = `${timeTable.map( t => t.map( t => {
      if (t['odpt:departureTime']) return t['odpt:departureTime'];
      if (t['odpt:arrivalTime']) return t['odpt:arrivalTime'];
      return '-';
    }).join(' ')).join('\n')}`;

    this.setState({
      diagramData: `${poleNames.join(' ')}\n${times}`,
      calendarData,
      busstopPole,
    }, () => {
      AsyncStorage.setItem('diagramData', this.state.diagramData);
      AsyncStorage.setItem('calendarData', this.state.calendarData);
      AsyncStorage.setItem('busstopPole', this.state.busstopPole);
    })
  }

  onSelectRoute = (e) => {
    const i = e.target.value;
    this.setState({
      selectedRoute: i,
      busTimetable: [],
    }, () => {
      this.loadTimetable();
      AsyncStorage.setItem('selectedRoute', this.state.selectedRoute)
    })
  }

  onSelectCalendar = (e) => {
    const i = e.target.value;
    this.setState({
      selectedCalendar: i,
    }, () => {
      this.loadTimetable();
      AsyncStorage.setItem('selectedCalendar', this.state.selectedCalendar)
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
            (this.state.busroutePattern && this.state.busroutePattern.length > 0 && !this.state.loading) ? <Nav className="mr-auto">
            <select defaultValue={this.state.selectedRoute} onChange={ this.onSelectRoute }>
              {
                this.state.busroutePattern.map( (r, i) => {
                  return <option key={i} value={i} >{r.title}</option>
                })
              }
            </select>
            <select style={{ marginLeft: 10, }} defaultValue={this.state.selectedCalendar} onChange={ this.onSelectCalendar }>
              {
                this.state.calendarData.map( (r, i) => {
                  return <option key={i} value={i} >{r.title}</option>
                })
              }
            </select>
            </Nav> : null
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
