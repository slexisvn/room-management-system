import { FC, useContext, useEffect, useState } from 'react';
import { Avatar, Menu, Dropdown, Modal } from 'antd';
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
import BillPage from '../bill';
import EquipmentPage from '../equipment';
import Tour from 'reactour';

const Dashboard: FC = () => {
  const [tourStep, setTourStep] = useState(0);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [pathname, setPathname] = useState('/analysis');
  const { setAuthenticate } = useContext(AuthenticationContext);

  const steps = [
    {
      selector: 'ul.ant-menu-inline li.ant-menu-item:nth-child(3)',
      content: 'Hãy tạo loại phòng!'
    },
    {
      selector: '.ant-page-header-heading-extra .ant-btn',
      content: 'Tạo mới loại phòng!'
    },
    {
      selector: '.ant-modal-wrap .ant-modal',
      content: 'Tạo thông tin loại phòng!'
    },
    {
      selector: 'ul.ant-menu-inline li.ant-menu-item:nth-child(2)',
      content: 'Hãy tạo phòng!'
    },
    {
      selector: '.ant-page-header-heading-extra .ant-btn',
      content: 'Tạo mới phòng!'
    },
    {
      selector: '.ant-modal-wrap .ant-modal',
      content: 'Tạo thông tin phòng!'
    },
    {
      selector: 'ul.ant-menu-inline li.ant-menu-item:nth-child(4)',
      content: 'Hãy tạo khách hàng!'
    },
    {
      selector: '.ant-page-header-heading-extra .ant-btn',
      content: 'Tạo mới khách hàng!'
    },
    {
      selector: '.ant-modal-wrap .ant-modal',
      content: 'Tạo thông tin khách hàng!'
    },
    {
      selector: 'ul.ant-menu-inline li.ant-menu-item:nth-child(5))',
      content: 'Hãy tạo hợp đồng!'
    },
    {
      selector: '.ant-page-header-heading-extra .ant-btn',
      content: 'Tạo mới hợp đồng!'
    },
    {
      selector: '.ant-modal-wrap .ant-modal',
      content: 'Tạo thông tin hợp đồng!'
    }
  ];

  useEffect(() => {
    const hasTourGuide = localStorage.getItem('TOUR_GUIDE');

    if (!hasTourGuide) {
      // localStorage.setItem('TOUR_GUIDE', 'TOUR_GUIDE')
      Modal.confirm({
        content: 'Bắt đầu hướng dẫn?',
        onOk: () => {
          setIsTourOpen(true);
          setTourStep(0);
        }
      });
    }
  }, []);

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

              if (item.path === '/kind-of-room') {
                setTourStep(1);
              }

              if (item.path === '/room') {
                setTourStep(4);
              }
            }}
          >
            {dom}
          </Link>
        )}
        fixSiderbar
      >
        <Switch>
          <Route render={() => <AnalysisPage />} key='analysis' path='/analysis' />
          <Route render={() => <RoomPage changeTourStep={setTourStep} />} key='room' path='/room' />
          <Route render={() => <CustomerPage />} key='customer' path='/customer' />
          <Route render={() => <AgreementPage />} key='agreement' path='/agreement' />
          <Route
            render={() => <KindOfRoomPage changeTourStep={setTourStep} />}
            key='kind-of-room'
            path='/kind-of-room'
          />
          <Route render={() => <UnitPricePage />} key='unit-price' path='/unit-price' />
          <Route render={() => <BillPage />} key='bill' path='/bill' />
          <Route render={() => <EquipmentPage />} key='equipment' path='/equipment' />
        </Switch>
        <Tour
          steps={steps}
          disableFocusLock
          showCloseButton={false}
          showButtons={false}
          showNavigation={false}
          goToStep={tourStep}
          isOpen={isTourOpen}
          disableKeyboardNavigation
          onRequestClose={() => setIsTourOpen(false)}
        />
      </ProLayout>
    </BrowserRouter>
  );
};

export default Dashboard;
