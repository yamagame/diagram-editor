import React, { Component } from 'react';
import DiagramView from '../../components/DiagramView';
import BusStopDialog from '../../components/BusStopDialog';
import DiagramDataDialog from '../../components/DiagramDataDialog';

const namespace = 'diagram';

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
      busStop: {
        name: '',
        data: {},
      },
      params: AsyncStorage.getItem('params', {}),
      width: window.innerWidth,
      height: window.innerHeight,
      diagramData: AsyncStorage.getItem('data', ''),
      diagramEditData: '',
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

  render() {
    return (
      <div style={{ overflow: 'hidden' }}>
        <nav className="navbar sticky-top navbar-light bg-light">
          <a className="navbar-brand" href="#">ダイアグラムエディタ</a>
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
      </div>
    )
  }
}

Diagram.defaultProps = {
}
