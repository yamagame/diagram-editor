import React, { Component } from 'react';
import {
  Row,
  Col,
  Button,
  Modal,
} from 'react-bootstrap';

export default class BusStopEditDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...props.busStop,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.busStop !== nextProps.busStop) {
      this.setState({
        ...nextProps.busStop,
      })
    }
  }

  onClose = () => {
    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  onEdited = () => {
    if (this.props.onEdited) {
      this.props.onEdited({
        name: this.state.name,
      });
    }
  }

  render() {
    const times = [];
    for (var i=0;i<24;i++) {
      times.push([]);
    }
    if (this.state.data.times) {
      this.state.data.times.forEach( t => {
        times[t.hour].push(t);
      })
    }
    return (
      <Modal
        show={this.props.show}
        size="lg"
        onHide={this.onClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            標柱データ
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={12}>
              <input
                type="text"
                style={{ width: '100%', marginBottom: 10, }}
                value={this.state.name}
                onChange={(e) => {
                  this.setState({
                    name: e.target.value,
                  })
                }}
                placeholder="標柱名"
                readOnly={this.props.readOnly?'readonly':null}
              />
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <table style={{ width: '100%', fontSize: 12, }}>
                <thead>
                  <tr key={i} style={{ border: 'solid 1px lightgray',  }} >
                    <th width={50}>
                      <span style={{ margin: 10, }}></span>
                    </th>
                    <th style={{ borderLeft: 'solid 1px lightgray', width: '50%', textAlign: 'center', }}>
                      <span>上り</span>
                    </th>
                    <th style={{ borderLeft: 'solid 1px lightgray', width: '50%', textAlign: 'center', }}>
                      <span>下り</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {
                    times.map( (t, i) => {
                      return (
                        <tr key={i} style={{ border: 'solid 1px lightgray',  }} >
                          <td width={50}>
                            <span style={{ margin: 10, }}>{ ('00'+i).slice(-2) }</span>
                          </td>
                          <td style={{ borderLeft: 'solid 1px lightgray', width: '50%', }}>
                            <span>{ t.filter( d => d.dir === 'up').map( v => `${v.min}` ).join(', ') }</span>
                          </td>
                          <td style={{ borderLeft: 'solid 1px lightgray', width: '50%', }}>
                            <span>{ t.filter( d => d.dir === 'down').map( v => `${v.min}` ).join(', ') }</span>
                          </td>
                        </tr>
                      )
                    })
                  }
                </tbody>
              </table>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.onEdited}>OK</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

BusStopEditDialog.defaultProps = {
  show: false,
  busStop: {
    name: '',
    data: {},
  },
  readOnly: false,
}
