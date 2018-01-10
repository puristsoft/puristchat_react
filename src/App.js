import React, { Component } from 'react';
import config from 'react-global-configuration';
import axios from 'axios';
import {Appbar, Container} from 'muicss/react';

import './App.css';
// eslint-disable-next-line 
import { Widget, addResponseMessage, addLinkSnippet, addUserMessage  } from 'react-chat-widget';
import logo from './logo.svg';


const param =  {channel: "ChatChannel"};

class App extends Component {
  constructor(props) {
		super(props);	
    
    this.state = {
      opMessages:[],
      myMessages: [],
      error: undefined,
      conversation_id: null,
      room_id: null,
      wsURI: null,
      login_auth: [],
      login_user:null,
      login_url:'',
      user_name:'',
      agent:''
    }
  }

  componentDidMount = () => {
    axios.request({
      method: 'get',
      url:'/config.json'
    })
    .then(configuration => {
    //  console.log(configuration.data);
      config.set(configuration.data)              ;

      let username = config.get('p_username')     ;
      let auth = config.get('Authorization')      ;
      let login_url = config.get('login_url')     ;
      
      this.setState({login_user: username, login_auth: auth, login_url: login_url}, () => {
        console.log(this.state);
        this.login(username, auth, login_url);
      })
    })
    .catch (error => {
     console.log(error);
    })
  }

  login = (username, auth,url) => {
    axios.request({
      method: 'post',
      url:url,
      params: {
        "p_username" : username 
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type' : 'application/json'
      },
      auth : {
        'username': auth.username,
        'password':auth.password
      }
    }).then(response => {
      // the data returned should be used for the chat.
      let results = response.data;
      // eslint-disable-next-line 
      var {status, access_token, name, rooms, token_timeout, token_type,url } = results;
      const uri = `${url}?access_token=${access_token}`;
      this.setState({ wsURI: uri, user_name: name }, () => {
        console.log(this.state);
      })
      var activeRooms = [];
      // eslint-disable-next-line 
      rooms.map(room => {
        if(room.status === 'online') {
          activeRooms.push(room);
        }
      })
      
      // if there is no active room... you cannot chat.
      if (activeRooms.length === 0) {
        // alert ('No Agent is available to chat with.');

      }
      else {
        // take the first active room from the activeRooms array of objects and start the chatting.
        var room = activeRooms.pop()
        // console.log(room.id);
        this.setState({ room_id: room.id, agent:room.agent }, () => {
            console.log(this.state);
          })
        this.connect_server(this.state.wsURI);
        }
      }).catch(error => {
        console.log(error);
      })
  }

  connect_server = (uri) => {
    console.log ('connecting...')

    //Connect using client native socket implementation
    this.socket = new WebSocket(uri);
    
    // console.log(this.socket.readyState);
    // this.socket.onopen = (event) => {
    //   console.log(this.socket.readyState);
    // }

    this.socket.addEventListener('open', (e) => {
    //  console.log(this.socket.readyState);  // readyState = 1 ... connectin open
    console.log('connection openned...');
     let sub_msg = {
        command: "subscribe",
        identifier: JSON.stringify(param)
      }
      this.socket.send(JSON.stringify(sub_msg));
    });
	
    this.socket.addEventListener('message', (event) => {
      
      var msg = JSON.parse(event.data);
      // if (!msg.type) console.log(event.data);

      if (msg.type === 'confirm_subscription') {
        //addResponseMessage(` Hi, ${this.state.user_name} I am ${this.state.agent}`);
        //addResponseMessage(` I will be you agent. How May I help you?`);
        console.log(msg);
        // this.socket.close();
        // join the room allocated to the user.
        let join_msg = {
          command: "message",
          identifier: JSON.stringify(param),
          data: JSON.stringify({action: 'join_room', room_id: this.state.room_id})  
        };        
        this.socket.send(JSON.stringify(join_msg));
      }

      if (msg.message && msg.message.conversation_id) { 
        // console.log(` message received: ${JSON.stringify(msg.message)}`);

        const sentBy = msg.message.sent_by.toLowerCase();
        // i got the conversation id ... now to join a room for chatting to start...
        //{"identifier":"{\"channel\":\"ChatChannel\"}","message":{"event":"latest_as_bulk","conversation_id":47,"body":"","created_at":null,"sent_by":"-"}}
        const conversation_id = msg.message.conversation_id;
        this.setState({conversation_id:conversation_id}, () => {
          // console.log(this.state);
          console.log(msg);
        })

        if( sentBy === "me") {
          console.log(`sent_by: ${sentBy}`);
          console.log( `conversation id: ${msg.message.conversation_id}`);

          const user_msgs = this.state.myMessages.slice();
          user_msgs.push(msg.message.body);
          this.setState({myMessages: user_msgs}, () => {
            console.log(this.state);
          })
          // this.socket.close();
        }

        else if(sentBy ===  "-") {
          console.log(`sent_by: ${sentBy}`);
          console.log( `conversation id: ${msg.message.conversation_id}`);

        }

        else {
          // sent by operator...
          const operator_msgs = this.state.opMessages.slice();
          operator_msgs.push(msg.message.body);
          this.setState({opMessages:operator_msgs}, () => {
            console.log(this.state);
            addResponseMessage(msg.message.body);  
          });
        }
      }
    }); 
    // this.socket.close();
  }

  handleNewUserMessage = (newMessage) => {
    // console.log(this.state.room_id);
    // console.log(`New message incomig! ${newMessage}`);
    // console.log(this.state.conversation_id + ' after posting a message');
    
    // addLinkSnippet({
    //   title: newMessage,
    //   link:'http://google.com'
    // })
  
    // Now send the message throught the backend API
    let msgObj = {
      command: "message",
      identifier: JSON.stringify(param),
      data: JSON.stringify({action: 'post_message', conversation_id: this.state.conversation_id, body: newMessage})
    };        
    
    if(this.state.room_id) {
    //   if((this.socket.readyState) === 1) {
      this.socket.send(JSON.stringify(msgObj));
    }
    else {
      let response = 'Connecting with Agent...' //this.state.messages.pop();  
      addResponseMessage(response);
      setTimeout(this.login(this.state.login_user, this.state.login_auth, this.state.login_url), 2000);
    }   
  }
  render() {
    // console.log('[App.js] Inside render()');
    let s1 = {verticalAlign: 'middle'};
    return (
      <div className="App">
        <Appbar>
          <Container>
            <table width="100%">
            <tbody>
              <tr className="mui--appbar-height" style={s1}>
                <td className="mui--appbar-height mui--text-title"><strong><i className="fa fa-university"> </i> Brand</strong></td>
                {/* <td className="mui--appbar-height mui--text-right">
                  <ul className=" mui-list--inline mui--text-body2">
                    <li><a >About</a></li>
                    <li><a >Pricing</a></li>
                    <li><a ><i className="fa fa-user" aria-hidden="true"></i> Login</a></li>
                  </ul>
                </td> */} 
              </tr>
            </tbody>
          </table> 
        </Container>
        </Appbar> 
        <div id="content-wrapper" className="mui--text-center">
          <br />
          <br />
          <div className="mui--text-center mui--text-display3 zoomInDown">Web Site Content</div>
          <br />
          <br />
          <i className="fa fa-university fa-5x mui--text-display3 mui--color-pink-A100 row wow zoomIn" aria-hidden="true"></i> 
        </div>
        <footer>
          <div className="mui-container mui--text-center">
            Copyright @2017-2018 PuristChat 
          </div>
        </footer>
        <Widget
          handleNewUserMessage={this.handleNewUserMessage} 
          profileAvatar={logo}
          title= {`Welcome ${this.state.user_name}` }
          subtitle= {this.state.agent ? `Agent: ${this.state.agent}`: 'Sorry; No active agent is available'}
        />
      </div>
    );
  }
}

export default App;
