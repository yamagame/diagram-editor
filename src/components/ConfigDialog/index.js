import React, { Component } from 'react';
import {
  Row,
  Col,
  Button,
  Modal,
  Dropdown,
} from 'react-bootstrap';

export default class ConfigDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      consumerKey: props.consumerKey,
      operator: props.operator,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.consumerKey !== nextProps.consumerKey) {
      this.setState({
        consumerKey: nextProps.consumerKey,
      })
    }
    if (this.props.operator !== nextProps.operator) {
      this.setState({
        operator: nextProps.operator,
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
        ...this.state,
      });
    }
  }

  onSelectHandler = (operator) => {
    return () => {
      this.setState({
        operator,
      })
    }
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
            オープンデータの読み込み
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={12}>
              <p><a href="https://tokyochallenge.odpt.org/" target="open-data-challenge">東京公共交通オープンデータチャレンジ</a>のデータの読み込みができます。<br/>
                コンシューマキーを入力して、バス事業者を選択後、OKボタンをクリックしてください。</p>
            </Col>
            <Col md={12}>
              <input
                type="text"
                style={{ width: '100%', marginBottom: 10, }}
                value={this.state.consumerKey}
                onChange={(e) => {
                  this.setState({
                    consumerKey: e.target.value,
                  })
                }}
                placeholder="コンシューマキーを入力してください"
              />
            </Col>
            <Col md={12}>
            <p>
            {
              <Dropdown>
                <Dropdown.Toggle size="sm" variant="outline-secondary" id="dropdown-basic">
                  { this.state.operator.title ? this.state.operator.title : 'バス事業者を選択してください' }
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {
                    this.props.operators.map( (r, i) => {
                      return <Dropdown.Item key={i} onSelect={this.onSelectHandler(r)} active={ this.state.operator.title === r.title } >{r.title}</Dropdown.Item>
                    })
                  }
                </Dropdown.Menu>
              </Dropdown>
            }
            </p>
            </Col>
            <Col md={12}>
              <div style={{ color: 'red' }}>
                <p>本アプリでは、個人情報や編集したデータの収集は行っておりません。<br/>データはブラウザのローカルストレージに保存されます。</p>
              </div>
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

ConfigDialog.defaultProps = {
  consumerKey: '',
  operator: {},
  operators: [],
}
