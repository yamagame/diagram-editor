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

export default class DiagramDataDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: props.text,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.text !== nextProps.text) {
      this.setState({
        text: (nextProps.text === null) ? '' : nextProps.text,
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
      this.props.onEdited(this.state.text);
    }
  }

  onChangeText = (value) => {
    this.setState({ text: value });
  }

  render() {
    return (
      <Modal
        show={this.props.show}
        size="lg"
        onHide={this.onClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            ダイアグラムデータ
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={12}>
              {
                <AceEditor
                  ref={ r => this.editor = r }
                  style={{
                    display: 'inline-block',
                    border: 'solid 1px lightgray',
                  }}
                  mode="text"
                  theme="chrome"
                  value={this.state.text}
                  width="100%"
                  height={`${this.props.height}px`}
                  onChange={this.onChangeText}
                  showPrintMargin={false}
                  fontSize={12}
                  name="digram_data_dialog"
                  editorProps={{$blockScrolling: Infinity}}
                  readOnly={this.props.readonly}
                />
              }
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

DiagramDataDialog.defaultProps = {
  show: false,
  name: '',
  height: 100,
}
