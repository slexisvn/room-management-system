import { FC, RefObject, useEffect, useRef, useState } from 'react';
import { Button } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import KindOfRoomGrid from './Grid';
import KindOfRoomModal from './Modal';
import { KindOfRoomGridRef, KindOfRoomModalRef, KindOfRoomPageProps } from './interface';

const KindOfRoomPage: FC<KindOfRoomPageProps> = ({ changeTourStep, changeTourOpen }) => {
  const [edit, setEdit] = useState('');
  const kindOfRoomGridRef: RefObject<KindOfRoomGridRef> = useRef(null);
  const kindOfRoomModalRef: RefObject<KindOfRoomModalRef> = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      changeTourStep(3);

      setTimeout(() => {
        changeTourOpen(false);
      }, 1500);
    }, 4000);
    // eslint-disable-next-line
  }, []);

  return (
    <PageContainer
      extra={[
        <Button
          type='primary'
          onClick={() => {
            kindOfRoomModalRef.current!.openModal();
            setTimeout(() => {
              changeTourStep(2);
            }, 300);
          }}
        >
          Thêm mới
        </Button>
      ]}
      header={{ title: 'Quản lý loại phòng' }}
    >
      <KindOfRoomGrid
        edit={id => setEdit(id)}
        ref={kindOfRoomGridRef}
        getKindOfRoomModalRef={() => kindOfRoomModalRef.current!}
      />
      <KindOfRoomModal
        ref={kindOfRoomModalRef}
        edit={edit}
        onCancel={() => setEdit('')}
        onOk={() => {
          if (edit) {
            setEdit('');
          }
          kindOfRoomGridRef.current!.fetchData();

          setTimeout(() => {
            changeTourOpen(true);
            changeTourStep(4);
          }, 300);
        }}
      />
    </PageContainer>
  );
};

export default KindOfRoomPage;
