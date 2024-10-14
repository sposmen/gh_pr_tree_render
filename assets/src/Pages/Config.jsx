import axios from "axios";
import { useEffect, useState } from "react";
import Col from "react-bootstrap/Col" ;
import Container from "react-bootstrap/Container" ;
import InputGroup from "react-bootstrap/InputGroup" ;
import Row from "react-bootstrap/Row" ;
import Form from "react-bootstrap/Form" ;
import { Eye, EyeSlashFill } from "react-bootstrap-icons";
import ToastContainer from "react-bootstrap/ToastContainer";
import Toast from "react-bootstrap/Toast";

const DEFAULT_CONFIGS = [
  { name: 'github_token', value: '' }
];

export async function loader({ params }) {
  const contact = await getContact(params.contactId);
  return { contact };
}

export const configRoutes = [
  {
    path: "config",
    element: <Config />,
  }
]

function Config() {
  const [configs, setConfigs] = useState([...DEFAULT_CONFIGS])
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState('');
  const [showPass, setShowPass] = useState(false);
  const clickHandler = () => {
    setShowPass((prev) => !prev);
  };

  const reFetch = () => axios.get('/api/v1/config').then(processResponse);
  const showMsg = (configName) => {
    setMsg(`Config: '${configName}' stored`);
    setShow(true);
  }

  const onConfigBlur = (name) => (
    ({ currentTarget: { value } }) => {
      const { id, value: oldValue } = configs.find(({ name: configName }) => configName === name)

      if (oldValue === value) return;

      const [method, url, body] = (() => {
        if (id) {
          return ['patch', `/api/v1/config/${id}`, { value }]
        } else {
          return ['post', `/api/v1/config`, { name, value }]
        }
      })()

      axios[method](url, body).then(() => showMsg(name)).then(reFetch)
    }
  )

  const processResponse = ({ data: fetchedConfigs }) => {
    const stageConfigs = [...configs];
    fetchedConfigs.forEach(({ id, name, value }) => {
      const config = stageConfigs.find(({ name: configName }) => configName === name)
      config.id = id;
      config.value = value
    })
    setConfigs(stageConfigs)
  }

  useEffect(() => reFetch() && undefined, []);

  return <>
    <h2>Config</h2>
    <Container fluid="md">
      {configs.map(({ id, name, value }) => (
        <Row key={name}>
          <Col>
            <Form>
              <InputGroup className="mb-3">
                <InputGroup.Text>{name}</InputGroup.Text>
                <Form.Control type={showPass ? 'text':'password'} placeholder="Value" aria-label="Value" defaultValue={value} onBlur={onConfigBlur(name)} />
                <InputGroup.Text onClick={clickHandler}>
                  {showPass ? <EyeSlashFill /> : <Eye />}
                </InputGroup.Text>
              </InputGroup>
            </Form>
          </Col>
        </Row>
      ))}
    </Container>
    <ToastContainer className="p-3" position="top-center">
      <Toast onClose={() => setShow(false)} show={show} delay={3000} autohide>
        <Toast.Body>{msg}</Toast.Body>
      </Toast>
    </ToastContainer>
  </>
}

export default Config;
