import React, {useState, useEffect, useReducer, memo, createRef} from 'react'
import { BrowserRouter as Router, Route, Link, NavLink, Redirect, Switch } from 'react-router-dom'
import { withRouter } from 'react-router'
import { Form, DatePicker, Button, Input, Icon, Tooltip, TimePicker, Select, Cascader, InputNumber } from 'antd'
import PropTypes from 'prop-types'
import { useInput } from './UseInput'
import './App.scss'
import 'antd/dist/antd.css'
import ErrorBoundary from './ErrorBoundary'
import axios from 'axios'

function App() {
  
  return (
    <Router basename='/test'>
      <div className='App-header'>
        <ul>
          <li>
            <Link to='/'>Home</Link>
          </li>
          <li>
            <NavLink to='/about' activeStyle={{color:'red'}}>About (UseState, Antd)</NavLink>
          </li>
          <li>
            <Link to='/topics'>Topics (Link parameter)</Link>
          </li>
          <li>
            <Link to='/redirect'>Redirect</Link>
          </li>
          <li>
            <Link to='/withRouter'>WithRouter</Link>
          </li>
          <li>
            <Link to='/sayHello'>Say Hello (props, proptypes, state, memo)</Link>
          </li>
          <li>
            <Link to='/fetchData'>Fetch Data (useReducer, useEffect, axios)</Link>
          </li>
          <li>
            <Link to='/form1'>Form 1</Link>
          </li>
          <li>
            <Link to='/form2'>Form 2</Link>
          </li>
          <li>
            <Link to='/form3'>Form 3</Link>
          </li>
          <li>
            <Link to='/errorBoundary'>Error Boundary</Link>
          </li>
        </ul>
      </div>
      <div className='App-content'>
        <Switch>
          <Route exact path='/' component={Home} />
          <Route path='/about' component={About} />
          <Route path='/topics' component={Topics} />
          <Route path='/redirect' render={() => <Redirect to='/'/>}/>
          <Route path='/withRouter' component={WithRouter1} />
          <Route path='/sayHello' render={() => <SayHello name='Joe'/>} />
          <Route path='/fetchData' render={() => <API />} />
          <Route path='/form1' component={Form1} />
          <Route path='/form2' component={Form2} />
          <Route path='/form3' component={Form3} />
          <Route path='/errorBoundary' component={ShowError} />
        </Switch>
      </div> 
    </Router>
  )
}

// define a JSX element
function Home() {

  const element = <h1>React App</h1>

  return (
    <div>
      {element}
      <h2>Home</h2>
    </div>
  )
}

// useState(initialState)
function About() {

  const [state, setState] = useState({isDisplayList: false}) 
  
  const handleEvent = (e) => {
    e.preventDefault()
    setState({isDisplayList: true})
  }

  return (
    <div>
      <h2>About {2+2}</h2>
      <div className='container'>
        <DatePicker className='item'/>
        {/* event handling */}
        <Button className='item' type='primary' icon='appstore' onClick={handleEvent}>Event</Button>
      </div>
      
      { // if statement and list
        state.isDisplayList &&
        <div>
          <h2>Events:</h2>
          <ul>
            {[1, 2, 3, 4, 5].map((i, index) =>
              <li key={index}>{i}</li>
            )}
          </ul>
        </div>
      }
    </div>
  )
}

// pass property in function component
const SayHello = ({name = 'default'}) => {
  const [greeting, setGreeting] = useState(`Hello ${name || 'default'}`)
  const [count, setCount] = useState(0); // initial state 0

  const handleIncrement = () => setCount(currentCount => currentCount + 1)
  const handleDecrement = () => setCount(currentCount => currentCount - 1)
  const handleChange = event => setGreeting(event.target.value)

  return (
    <div>
      <h2>{greeting}</h2>
      <input type="text" onChange={handleChange} />
      <Count count={count} />
      <button type="button" onClick={handleIncrement}>
        Increment
      </button>
      <button type="button" onClick={handleDecrement}>
        Decrement
      </button>
    </div>
  )
}

SayHello.prototype = {
  name: PropTypes.string.isRequired,
}

// memo: prevent a rerender when the incoming props, i.e. count, of this component haven't changed
const Count = memo(({ count }) => {
  console.log('Does it (re)render?');
  return <h1>{count}</h1>;
});

// reducer
const apiReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_INIT':
        return {
          ...state,
          isLoading: true,
          isError: false
        }
    case 'FETCH_SUCCESS':
        return {
          ...state,
          isLoading: false,
          isError: false,
          data: action.payload,
        }
    case 'FETCH_FAILURE':
        return {
          ...state,
          isLoading: false,
          isError: true,
        }
    default:
        throw new Error()
  }
}

// useEffect invoke API when url state change
const useData = (initialUrl, initialData) => {
  const [url, setUrl] = useState(initialUrl);
  const [state, dispatch] = useReducer(
      apiReducer  // reducer
    , {
        isLoading: false,
        isError: false,
        data: initialData,
      } // init state
  )

  // execute whenever url state is changed
  useEffect(() => {
    // prevent update state on unmounted component
    let didCancel = false;

    const fetchData = async () => {
      dispatch({ type: 'FETCH_INIT' });
      try {
        const result = await axios(url);

        if (!didCancel) {
          dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: 'FETCH_FAILURE' });
        }
      }
    };

    fetchData();

    return () => { // invoke when unmount component, clean up function
      didCancel = true;
    };
  }, [url]); // url is variable on which the hook depends 

  return [state, setUrl];
};

const API = () => {
  const [query, setQuery] = useState('redux');
  const [{ data, isLoading, isError }, setUrl] = useData(
    `http://hn.algolia.com/api/v1/search?query=${query}`,
    { hits: [] },
  );
  
  return (
    <div>
      <h2>API call</h2>
      <form
        onSubmit={event => {
          setUrl(
            `http://hn.algolia.com/api/v1/search?query=${query}`,
          );
          event.preventDefault();
        }}
      >
        <input
          type="text"
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      
      {isError && <div>Something went wrong ...</div>}
      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <ul>
          {data.hits.map(item => (
            <li key={item.objectID}>
              <a href={item.url}>{item.title}</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// withRouter
const WithRouter1 = withRouter(({ match, location, history })=> {
  return (
    <div>Your location is {location.pathname}</div>
  )
})

// use parameters
function Topics({match}) {
  return (
    <div>
      <h2>Topics</h2>
      <ul>
        <li>
          <Link to={`${match.url}/topic1`}>topic1</Link>
        </li>
        <li>
          <Link to={`${match.url}/topic2`}>topic2</Link>
        </li>
        <li>
          <Link to={`${match.url}/topic3`}>topic3</Link>
        </li>
      </ul>
      <Route exact path={match.path} render={() => <h3>Select topic</h3>} />
      <Route path={`${match.url}/:topicId`} component={Topic} />
    </div>
  )
}

function Topic({match}){
  return (
    <div>
      <h3>{match.params.topicId}</h3>
    </div>
  )
}

function Form1() {
  const { value:firstName, bind:bindFirstName, reset:resetFirstName } = useInput('');
  const { value:lastName, bind:bindLastName, reset:resetLastName } = useInput('');
  const layout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 20 },
  }
  const buttonLayout = {
    wrapperCol: { span: 10, offset: 0 },
  }

  // use REF
  // const ref = createRef();
  // useEffect(() => ref.current.focus(), []);

  const handleSubmit = (evt) => {
      evt.preventDefault();
      alert(`Submitting Name ${firstName} ${lastName}`);
      resetFirstName();
      resetLastName();
  }

  return (
    <div className='container'>
    <Form layout='horizontal' onSubmit={handleSubmit}>
      <Form.Item label='First Name' {...layout}>
        <Input type="text" {...bindFirstName} 
          placeholder="Enter your first name"
          prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
          suffix={
            <Tooltip title="8-12 characters">
              <Icon type="info-circle" style={{ color: 'rgba(0,0,0,.45)' }} />
            </Tooltip>
          }
        />
      </Form.Item>
      <Form.Item label='Last Name' {...layout}>
        <Input type="text" {...bindLastName} 
          placeholder="Enter your last name"
          prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
          suffix={
            <Tooltip title="8-12 characters">
              <Icon type="info-circle" style={{ color: 'rgba(0,0,0,.45)' }} />
            </Tooltip>
          }
        />
      </Form.Item>
      <Form.Item {...buttonLayout}>
        <Button type="primary" htmlType="submit">Submit</Button>
      </Form.Item>
    </Form>
    </div>
  );
}

function Form2() {
  const { Option } = Select

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 5 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 12 },
    },
  }

  return (
    <Form {...formItemLayout}>
      <Form.Item
        label="Fail"
        validateStatus="error"
        help="Should be combination of numbers & alphabets"
      >
        <Input placeholder="unavailable choice" id="error" />
      </Form.Item>

      <Form.Item label="Warning" validateStatus="warning">
        <Input placeholder="Warning" id="warning" />
      </Form.Item>

      <Form.Item
        label="Validating"
        hasFeedback
        validateStatus="validating"
        help="The information is being validated..."
      >
        <Input placeholder="I'm the content is being validated" id="validating" />
      </Form.Item>

      <Form.Item label="Success" hasFeedback validateStatus="success">
        <Input placeholder="I'm the content" id="success" />
      </Form.Item>

      <Form.Item label="Warning" hasFeedback validateStatus="warning">
        <Input placeholder="Warning" id="warning2" />
      </Form.Item>

      <Form.Item
        label="Fail"
        hasFeedback
        validateStatus="error"
        help="Should be combination of numbers & alphabets"
      >
        <Input placeholder="unavailable choice" id="error2" />
      </Form.Item>

      <Form.Item label="Success" hasFeedback validateStatus="success">
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item label="Warning" hasFeedback validateStatus="warning">
        <TimePicker style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item label="Error" hasFeedback validateStatus="error">
        <Select defaultValue="1">
          <Option value="1">Option 1</Option>
          <Option value="2">Option 2</Option>
          <Option value="3">Option 3</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Validating"
        hasFeedback
        validateStatus="validating"
        help="The information is being validated..."
      >
        <Cascader defaultValue={['1']} options={[]} />
      </Form.Item>

      <Form.Item label="inline" style={{ marginBottom: 0 }}>
        <Form.Item
          validateStatus="error"
          help="Please select the correct date"
          style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}
        >
          <DatePicker />
        </Form.Item>
        <span style={{ display: 'inline-block', width: '24px', textAlign: 'center' }}>-</span>
        <Form.Item style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}>
          <DatePicker />
        </Form.Item>
      </Form.Item>

      <Form.Item label="Success" hasFeedback validateStatus="success">
        <InputNumber style={{ width: '100%' }} />
      </Form.Item>
    </Form>
  )
}


const Form3 = Form.create()((props) => {
  const { form } = props;
  const { getFieldDecorator } = form;

  const handleSubmit = e => {
    e.preventDefault();
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
    });
  };

  return (
    <Form labelCol={{ span: 5 }} wrapperCol={{ span: 12 }} onSubmit={handleSubmit}>
      <Form.Item label="Note">
        {getFieldDecorator('note', {
          rules: [{ required: true, message: 'Please input your note!' }],
        })(<Input />)}
      </Form.Item>
      <Form.Item wrapperCol={{ span: 12, offset: 5 }}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  )
})

function Artists({artistName}) {
  if (artistName === 'joe') {
    throw new Error ('Error thrown!')
  }
  
  return (
    <div>
      {artistName}
    </div>
  )
}

function ShowError() {
  return (
    <ErrorBoundary>
      <Artists artistName='joe' />
    </ErrorBoundary>
  )
} 


export default App
