import React from 'react';
import ReactDOM from 'react-dom';
import Dexie from 'dexie';
import { ConfigProvider } from 'antd';
import viVN from 'antd/lib/locale/vi_VN';
import 'moment/locale/vi';
import App from './App';
import AuthenticationProvider from './authentication-provider';
import reportWebVitals from './reportWebVitals';
import './style';

window.roomManagementSystemDB = new Dexie('room-management-system');
window.roomManagementSystemDB
  .version(1)
  .stores({
    account: 'id,username,password'
  })
  .stores({
    room: 'id,code,name,stillEmpty,kindOfRoomId'
  })
  .stores({
    kindOfRoom: 'id,code,name,price,deposit'
  })
  .stores({
    agreement: 'id,code,roomId,customerIds,date'
  })
  .stores({
    customer: 'id,code,fullName,identityCardNumber,dateOfBirth,sex,address,phoneNumber,job'
  })
  .stores({
    unitPrice: 'id,code,water,electricity,parking,date'
  });

ReactDOM.render(
  <React.StrictMode>
    <ConfigProvider locale={viVN}>
      <AuthenticationProvider>
        <App />
      </AuthenticationProvider>
    </ConfigProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
