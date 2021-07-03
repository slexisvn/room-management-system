import { FC, useContext, useState } from 'react';
import { Avatar, Menu, Dropdown } from 'antd';
import type { MenuClickEventHandler } from 'rc-menu/lib/interface';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import ProLayout from '@ant-design/pro-layout';
import { Link, Switch, Route, BrowserRouter } from 'react-router-dom';
import { routes } from './routes';
import { AuthenticationContext } from '../authentication-provider';
import AnalysisPage from '../analysis';
import RoomPage from '../room';
import KindOfRoomPage from '../kind-of-room';
import CustomerPage from '../customer';
import AgreementPage from '../agreement';
import UnitPricePage from '../unitPrice';
import BillPage from '../bill'

const Dashboard: FC = () => {
  const [pathname, setPathname] = useState('/analysis');
  const { setAuthenticate } = useContext(AuthenticationContext);

  const handleUserMenuClick: MenuClickEventHandler = e => {
    if (e.key === 'logout') {
      setAuthenticate(false);
      localStorage.removeItem('access-token');
    }
  };

  const renderUserMenu = () => (
    <Menu onClick={handleUserMenuClick}>
      <Menu.Item key='logout' icon={<LogoutOutlined />}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <BrowserRouter>
      <ProLayout
        {...routes}
        location={{
          pathname
        }}
        title='Quản lý phòng trọ'
        logo={null}
        rightContentRender={() => (
          <Dropdown overlay={renderUserMenu()}>
            <Avatar size='small' icon={<UserOutlined />} />
          </Dropdown>
        )}
        menuItemRender={(item, dom) => (
          <Link
            to={item.path!}
            onClick={() => {
              setPathname(item.path!);
            }}
          >
            {dom}
          </Link>
        )}
        fixSiderbar
      >
        <Switch>
          <Route render={() => <AnalysisPage />} key='analysis' path='/analysis' />
          <Route render={() => <RoomPage />} key='room' path='/room' />
          <Route render={() => <CustomerPage />} key='customer' path='/customer' />
          <Route render={() => <AgreementPage />} key='agreement' path='/agreement' />
          <Route render={() => <KindOfRoomPage />} key='kind-of-room' path='/kind-of-room' />
          <Route render={() => <UnitPricePage />} key='unit-price' path='/unit-price' />
          <Route render={() => <BillPage />} key='bill' path='/bill' />
        </Switch>
      </ProLayout>
    </BrowserRouter>
  );
};

export default Dashboard;
