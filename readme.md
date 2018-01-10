

PuristChat designed to ease the process of integrating backend applications that provide support to end customers, in simple scenario,  operator/agent chat support  may solve a his problem without the need to have backend system integrations , however , many enterprise customers may found that not enough , webhooks is the answer to extend support whilst providing more details about the case in hand including getting customer profile , account , purchase history ..etc. 

Our goal with PuristChat is to make customer support easy, fun, and accessible to enterprise with the desire to make better customer relationship. 

# React Chat 

This is example of using popup widget in react-app bootstrap from
 [ https://github.com/Wolox/react-chat-widget ]

Adding user info and some code to load agent 


## [Start with PuristChat ]( http://www.dev.puristchat.com/signup/get_started )
 
PuristChat is a hosted development environment for building chat support apps.
Developers using PuristChat get the full capabilities of APIs for chat support applications, approval is required to get your account setup. 

## Setup a test user (end customer )

You need to setup a user to testing web-hooks , company->user->New User 

## Setup an operator or agent 

Setup operator , operator -> new 

## Setup a support category 
Setup a support category -> new , enter the web-hooks URL , make URL points to /puristchat/receive , you can change in nodejs app and change here later.

## Play arround

Open browser session 

[Login as operator in PuristChat ]( http://www.dev.operator.puristchat.com/)

Wait for end user to chat 

Open new browser session 

[Login as end customer in PuristChat ]( http://www.dev.user.puristchat.com/)

Say something to agent 

## Config 
```

{
    "login_url":"http://api.puristchat.com/login",
    "p_username" : "user@account.puristchat.com",
    "Authorization": {
        "username": "Your API Key",
        "password": "Your password"
    }
}
```


# Run demo 

```

Clone puristchat_react
Cd /puristchat_react

npm install
npm run 

test at localhost:3000

```

Type hello , while operator is active , reply from react widget  



 

  


