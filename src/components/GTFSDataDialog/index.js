import React, { Component } from 'react';
import {
  Row,
  Col,
  Button,
  Modal,
} from 'react-bootstrap';
import AceEditor from 'react-ace';
import 'brace/mode/plain_text';
import 'brace/theme/chrome';

function EditCell({ text, onChange, editHeight=100, readonly=false, }) {
  return (
    <Col md={12}>
      {
        <AceEditor
          style={{
            display: 'inline-block',
            border: 'solid 1px lightgray',
          }}
          mode="text"
          theme="chrome"
          value={text}
          width="100%"
          height={`${editHeight}px`}
          onChange={onChange}
          showPrintMargin={false}
          fontSize={12}
          name="gtfs_data_dialog"
          editorProps={{$blockScrolling: Infinity}}
          readOnly={readonly}
        />
      }
    </Col>
  )
}

export default class GTFSDataDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gtfsData: props.gtfsData,
      initialGtfsData: props.gtfsData,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.gtfsData !== nextProps.gtfsData) {
      const gtfsData = (nextProps.gtfsData === null) ? '' : nextProps.gtfsData;
      this.setState({
        gtfsData,
        initialGtfsData: gtfsData,
      })
    }
  }

  onClose = () => {
    if (this.props.onClose) {
      this.setState({
        gtfsData: this.state.initialGtfsData,
      })
      this.props.onClose();
    }
  }

  onEdited = () => {
    if (this.props.onEdited) {
      this.props.onEdited(this.state.gtfsData);
    }
  }

  onChangeHanlder = (key) => {
    return (value) => {
      const state = {
        gtfsData: { ...this.state.gtfsData },
      }
      state.gtfsData[key] = value;
      this.setState(state, () => {
        console.log(this.state);
      });
    }
  }

  render() {
    const editHeight = 100;
    return (
      <Modal
        show={this.props.show}
        size="lg"
        onHide={this.onClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            GTFSデータの読み込み
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            {
              this.props.files.map( (v,i) => {
                return (
                  <Col md={12} key={i}>
                    <Col md={12}>
                      <span>{ v.title }</span>
                    </Col>
                    <EditCell
                      text={this.state.gtfsData[v.key]}
                      onChange={this.onChangeHanlder(v.key)}
                    />
                  </Col>
                )
              })
            }
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.onEdited}>OK</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

GTFSDataDialog.defaultProps = {
  show: false,
  name: '',
  height: 100,
  gtfsData: {},
  files: [],
}
