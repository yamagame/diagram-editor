const escapeChar = {
  n: '\n',
  r: '\r',
  t: '\t',
  '"': '"',
  "'": "'",
  "\\": "\\",
}

function parseOneLine(row, delimiter=',') {
  const r = [];
  const quates = ['"', "'"];
  let inquote = false;
  let inescape = false;
  let item = null;
  let quoteBuff = null;
  for (var i = 0, len = row.length; i < len; i++) {
    if (item === null) item = '';
    var e = row[i];
    if (inescape) {
      if (typeof escapeChar[e] !== 'undefined') {
        item += escapeChar[e];
      } else {
        item += e;
      }
      inescape = false;
    } else
    if (e === '\\') {
      inescape = true;
    } else
    if (quates.indexOf(e) >= 0 && !inquote) {
      inquote = true;
      quoteBuff = e;
    } else
    if (inquote && e === quoteBuff) {
      inquote = false;
      quoteBuff = null;
    } else
    if (e === delimiter && !inquote && !inescape) {
      r.push(item);
      item = null;
    } else {
      item += e;
    }
  }
  if (item !== null) {
    r.push(item);
  }
  return r;
}

export const parseCSV = (csv, delimiter=',') => {
  const val = []
  let head = null;
  csv.replace('\r\n','\n').replace('\r','\n').split('\n').forEach( (row, i) => {
    if (row !== '') {
      if (head == null) {
        head = parseOneLine(row, delimiter).map( v => v.trim() );
      } else {
          const b = parseOneLine(row, delimiter);
          const v = {}
          b.forEach( (t,i) => {
            if (head.length > i) {
              v[head[i]] = t;
            }
          })
          val.push(v);
      }
    }
  })
  return val;
}

function escapeDoubleQuotes(s) {
  if (!s.match(/\"/g)) return s;
  return s.replace(/\"/g,'\\"')
}

export const exportKeys = (data, keys={}) => {
  return ((data) => {
    data.forEach( v => {
      Object.keys(v).forEach( k => {
        keys[k] = k;
      })
    })
    return Object.keys(keys).sort();
  })(data);
}

export const makeCSV = (data, keys) => {
  const head = keys.map( (k,i) => {
    if (i > 0) return `,${escapeDoubleQuotes(keys[k])}`
    return escapeDoubleQuotes(keys[k]);
  }).join('');
  const body = data.map( line => {
    return keys.map( (k,i) => {
      if (i > 0) return `,${escapeDoubleQuotes(line[k])}`
      return escapeDoubleQuotes(line[k]);
    }).join('');
  }).join('\n');
  return `${head}\n${body}`;
}

export const parseGTFSData = ({
  routesAll,
  tripsAll,
  stopTimesAll,
  stopsAll,
}, agencyId=1) => {
    const routes = ((routes) => {
      const route_ids = {}
      routes.forEach( v => route_ids[v.route_id] = v )
      return Object.keys(route_ids).map( v => route_ids[v] );
    })(routesAll.filter( v => v.agency_id == agencyId));

    const trips = ((trips, routes) => {
      const route_ids = {}
      routes.forEach( v => route_ids[v.route_id] = v )
      return trips.filter( v => typeof route_ids[v.route_id] !== 'undefined')
    })(tripsAll, routes)

    const stopTimes = ((stopTimes, trips) => {
      const trip_ids = {}
      trips.forEach( v => trip_ids[v.trip_id] = v )
      return stopTimes.filter( v => typeof trip_ids[v.trip_id] !== 'undefined')
    })(stopTimesAll, trips)

    const stops = ((stops, stopTimes) => {
      const stop_ids = {}
      stops.forEach( v => stop_ids[v.stop_id] = v )
      return stops.filter( v => typeof stop_ids[v.stop_id] !== 'undefined')
    })(stopsAll, stopTimes)

    return {
      routes,
      trips,
      stopTimes,
      stops,
    }
}
