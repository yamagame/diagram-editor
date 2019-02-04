import React, { Component } from 'react';
import DiagramView from '../../components/DiagramView';
import BusStopDialog from '../../components/BusStopDialog';
import DiagramDataDialog from '../../components/DiagramDataDialog';
import GTFSDataDialog from '../../components/GTFSDataDialog';
import ConfigDialog from '../../components/ConfigDialog';
import {
  Nav,
} from 'react-bootstrap';
import 'whatwg-fetch'
import * as Utils from './utils';

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

const files = [
  { title: 'agency.txt', key: 'agency', },
  { title: 'routes.txt', key: 'routes', },
  { title: 'trips.txt', key: 'trips', },
  { title: 'stops.txt', key: 'stops', },
  { title: 'stop_times.txt', key: 'stop_times', },
]

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
      showGTFSDataDialog: false,
      busStop: {
        name: '',
        data: {},
      },
      params: AsyncStorage.getItem('params', {}),
      width: window.innerWidth,
      height: window.innerHeight,
      diagramData: AsyncStorage.getItem('diagramData', ''),
      diagramEditData: '',
      busstopPole: [],
      busroutePattern: [],
      busTimetable: [],
      busRouteTable: [],
      GTFSAllData: {},
      consumerKey: AsyncStorage.getItem('consumerKey', ''),
      operator: AsyncStorage.getItem('operator', { title: '', key: '', }),
      loading: '',
      mode: AsyncStorage.getItem('mode', 'OpenData'),
      selectedAgency: AsyncStorage.getItem('selectedAgency', 0),
      selectedRoute: AsyncStorage.getItem('selectedRoute', 0),
      selectedCalendar: AsyncStorage.getItem('selectedCalendar', 0),
      calendarData: AsyncStorage.getItem('calendarData', CalendarData),
      agencyData: [],
      gtfsData: AsyncStorage.getItem('gtfsData', {}),
    }
    if (this.state.mode === 'OpenData') {
      this.state = {
        ...this.state,
        busstopPole: AsyncStorage.getItem('busstopPole', []),
        busroutePattern: AsyncStorage.getItem('busroutePattern', []),
        busTimetable: AsyncStorage.getItem('busTimetable', []),
        busRouteTable: AsyncStorage.getItem('busRouteTable', []),
        agencyData: AsyncStorage.getItem('agencyData', []),
      }
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
    this.loadData();
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
      mode: 'OpenData',
    }, () => {
      AsyncStorage.setItem('busstopPole', this.state.busstopPole);
      AsyncStorage.setItem('busroutePattern', this.state.busroutePattern);
      AsyncStorage.setItem('busTimetable', this.state.busTimetable);
      AsyncStorage.setItem('diagramData', this.state.diagramData)
      AsyncStorage.setItem('selectedRoute', this.state.selectedRoute)
      AsyncStorage.setItem('mode', this.state.mode);
      this.loadData();
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

  loadDataFromOpenData = async () => {
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
      selectedAgency: 0,
      selectedRoute: 0,
      selectedCalendar: 0,
      loading: '',
      diagramData: '',
    }, async () => {
      await this.loadTimetable();
      AsyncStorage.setItem('busstopPole', this.state.busstopPole);
      AsyncStorage.setItem('busroutePattern', this.state.busroutePattern);
      AsyncStorage.setItem('busTimetable', this.state.busTimetable);
      AsyncStorage.setItem('diagramData', this.state.diagramData)
      AsyncStorage.setItem('selectedAgency', this.state.selectedAgency)
      AsyncStorage.setItem('selectedRoute', this.state.selectedRoute)
      AsyncStorage.setItem('selectedCalendar', this.state.selectedCalendar)
    })
  }

  loadDataFromGTFS = async () => {
  }

  loadData = async () => {
    if (this.state.mode === 'OpenData') {
      await this.loadDataFromOpenData();
    } else
    if (this.state.mode === 'GTFS') {
      await this.loadDataFromGTFS();
    }
  }

  loadTimetableFromOpenData = async () => {
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

  loadTimetableFromGTFS = async () => {

    //console.log(`load ${this.state.selectedAgency} ${this.state.selectedRoute} ${this.state.selectedCalendar}`);

    const agencyID = this.state.agencyData[this.state.selectedAgency].agency_id;
    const gtfsEditData = Utils.parseGTFSData(this.state.GTFSAllData, agencyID);

    function routeTitle(v) {
      if (v.route_short_name) return `${v.route_id}:${v.route_short_name}`;
      if (v.route_long_name) return `${v.route_id}:${v.route_long_name}`;
      return `${v.route_id}:`;
    }

    const busroutePattern = gtfsEditData.routes.map( v => {
      return {
        title: routeTitle(v),
        ...v,
      }
    })

    const busRoute = busroutePattern[this.state.selectedRoute];

    const service_ids = {}
    gtfsEditData.trips.forEach( v => {
      if (v.route_id === busRoute.route_id) {
        service_ids[v.service_id] = v.service_id;
      }
    })

    const calendarData = Object.keys(service_ids).map( v => {
      return {
        title: v,
      }
    })

    const selectedCalendar = (calendarData.length > this.state.selectedCalendar) ? this.state.selectedCalendar : 0;

    const state = {
      busroutePattern,
      calendarData,
      selectedCalendar,
      showGTFSDataDialog: false,
    }

    this.setState(state, () => {

      const busRoute = this.state.busroutePattern[this.state.selectedRoute];
      // console.log(`busRoute ${JSON.stringify(busRoute)}`);
      const busCalendar = this.state.calendarData[this.state.selectedCalendar];
      const { stopTimes, stops, trips, } = gtfsEditData;
      const trip_ids = {}
      const routeTrips = trips.filter( v => {
        const r = (v.route_id === busRoute.route_id && v.service_id === busCalendar.title);
        if (r) {
          trip_ids[v.trip_id] = v;
        }
        return r;
      })
      const routeTimes = stopTimes.filter( v => ( typeof trip_ids[v.trip_id] !== 'undefined' ) )
      const routeStops = ((routeTimes) => {
        const stop_ids = {}
        const a = {}
        stops.forEach( v => {
          a[v.stop_id] = v;
        })
        routeTimes.forEach( v => {
          stop_ids[v.stop_id] = a[v.stop_id];
        })
        return stop_ids;
      })(routeTimes, stops);

      // console.log(routeTrips);
      // console.log(routeTimes);
      // console.log(routeStops);

      const tripIdStops = {}
      routeTimes.forEach( v => {
        if (typeof tripIdStops[v.trip_id] === 'undefined') {
          tripIdStops[v.trip_id] = [];
        }
        tripIdStops[v.trip_id].push(v);
      })

      let stopList = [];
      const timeList = [];
      let diffCount = 0;

      function margeStops(a, b) {
        let n = 0;
        let o = [];
        for (var i=0;i<a.length;i++) {
          let p = [];
          let found = false;
          for (var j=n;j<b.length;j++) {
            if (a[i].stop_id === b[j].stop_id) {
              n=j+1;
              found = true;
              break;
            } else {
              p.push(b[j]);
            }
          }
          if (found) {
            o.push(...p);
          }
          o.push(a[i]);
        }
        for (var i=n;i<b.length;i++) {
          o.push(b[i]);
        }
        return o;
      }

      function reorderTimes(times, stops) {
        const newtimes = [];
        let n=0;
        for (var i=0;i<times.length;i++) {
          let t = [];
          for (var j=n;j<stops.length;j++) {
            if (times[i].stop_id === stops[j].stop_id) {
              newtimes.push(...t);
              t = null;
              newtimes.push(times[i]);
              n = j+1;
              break;
            }
            t.push({ arrival_time: '', departure_time: '', stop_id: stops[n].stop_id, });
          }
          if (t) {
            //error!!
          }
        }
        for (var i=n;i<stops.length;i++) {
          newtimes.push({ arrival_time: '', departure_time: '', stop_id: stops[i].stop_id, });
        }
        return newtimes;
      }

      Object.keys(tripIdStops).forEach( (key, i) => {
        //if (i>=50) return;
        const times = tripIdStops[key];
        const timesr = [ ...times ].reverse();
        if (stopList.length <= 0) {
          try {
            if (trip_ids[times[0].trip_id].direction_id === '1') {
              stopList = timesr;
              tripIdStops[key] = timesr;
            } else {
              stopList = times;
            }
          } catch(err) {
            stopList = times;
          }
        } else 
        {
          const a = margeStops(times, stopList);
          const b = margeStops(timesr, stopList);
          if (a.length <= b.length) {
            stopList = a;
          } else {
            stopList = b;
            tripIdStops[key] = timesr;
          }
        }
      })
      stopList = stopList.map( v => ({ ...routeStops[v.stop_id], }));

      Object.keys(tripIdStops).forEach( (key,i) => {
        timeList.push(reorderTimes(tripIdStops[key], stopList))
      })

      // console.log(tripIdStops);
      // console.log(stopList);

      const poleNames = stopList.reverse().map( v => `${v.stop_name.replace(/\s/g, '')}(${v.stop_id})` )
      // console.log(stopNames);

      const timePoints = timeList.map( v => v.reverse().map( v => v.arrival_time).join(' ') ).join('\n')

      this.setState({
        diagramData: `${poleNames.join(' ')}\n${timePoints}`,
      }, () => {
        AsyncStorage.setItem('diagramData', this.state.diagramData);
      })

    });
  }

  loadTimetable = async () => {
    if (this.state.mode === 'OpenData') {
      await this.loadTimetableFromOpenData();
    } else
    if (this.state.mode === 'GTFS') {
      await this.loadTimetableFromGTFS();
    }
  }

  onSelectAgency = (e) => {
    const i = e.target.value;
    this.setState({
      selectedAgency: i,
      selectedRoute: 0,
      selectedCalendar: 0,
      busTimetable: [],
    }, () => {
      this.loadTimetable();
      AsyncStorage.setItem('selectedAgency', this.state.selectedAgency)
      AsyncStorage.setItem('selectedRoute', this.state.selectedRoute)
      AsyncStorage.setItem('selectedCalendar', this.state.selectedCalendar)
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

  openGTFSDataDialog = () => {
    this.setState({
      showGTFSDataDialog: true,
    });
  }

  onEditedGTFSData = (gtfsData) => {

    console.log(gtfsData);
    files.forEach( v => {
      if (!gtfsData[v.key]) gtfsData[v.key] = '';
    })

    const { agency, routes, stops, stop_times, trips, } = gtfsData;

    const GTFSAllData = {
      agencyAll: Utils.parseCSV(agency),
      routesAll: Utils.parseCSV(routes),
      stopsAll: Utils.parseCSV(stops),
      stopTimesAll: Utils.parseCSV(stop_times),
      tripsAll: Utils.parseCSV(trips),
    }

    const agency_ids = (() => {
      const b = {}
      GTFSAllData.agencyAll.forEach( v => {
        b[v.agency_id] = v;
      });
      const a = {};
      GTFSAllData.routesAll.forEach( v => {
        if (v.agency_id) {
          if (b[v.agency_id]) {
            a[v.agency_id] = b[v.agency_id];
          } else {
            a[v.agency_id] = {}
          }
          a[v.agency_id].agency_id = v.agency_id;
        }
      })
      return Object.keys(a).map( v => a[v] );
    })();

    if (agency_ids.length <= 0) {
      return;
    }

    function agencyTitle(v) {
      if (v.agency_name) {
        return `${v.agency_id}:${v.agency_name}`;
      }
      return `${v.agency_id}`
    }

    this.setState({
      busroutePattern: [],
      calendarData: [],
      showGTFSDataDialog: false,
      selectedAgency: 0,
      selectedRoute: 0,
      selectedCalendar: 0,
      GTFSAllData,
      agencyData: agency_ids.map( v => ({ title: agencyTitle(v), agency_id: v.agency_id, ...v }) ),
      mode: 'GTFS',
    }, () => {
      AsyncStorage.setItem('mode', this.state.mode);
      this.loadTimetable();
    })
  }

  onCloseGTFSData = () => {
    this.setState({
      showGTFSDataDialog: false,
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
            <select defaultValue={this.state.selectedAgency} value={this.state.selectedAgency} onChange={ this.onSelectAgency }>
              {
                this.state.agencyData.map( (r, i) => {
                  return <option key={i} value={i} >{r.title}</option>
                })
              }
            </select>
            <select style={{ marginLeft: 10, }} defaultValue={this.state.selectedRoute} value={this.state.selectedRoute} onChange={ this.onSelectRoute }>
              {
                this.state.busroutePattern.map( (r, i) => {
                  return <option key={i} value={i} >{r.title}</option>
                })
              }
            </select>
            <select style={{ marginLeft: 10, }} defaultValue={this.state.selectedCalendar} value={this.state.selectedCalendar} onChange={ this.onSelectCalendar }>
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
              onClick={this.openGTFSDataDialog}
            >GTFS</button>
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
        <GTFSDataDialog
          show={this.state.showGTFSDataDialog}
          gtfsData={this.state.gtfsData}
          onClose={this.onCloseGTFSData}
          onEdited={this.onEditedGTFSData}
          height={this.state.height-240}
          files={files}
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
