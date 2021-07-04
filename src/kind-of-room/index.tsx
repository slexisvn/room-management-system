import { FC, RefObject, useRef, useState } from 'react';
import { Button } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import KindOfRoomGrid from './Grid';
import KindOfRoomModal from './Modal';
import { KindOfRoomGridRef, KindOfRoomModalRef, KindOfRoomPageProps } from './interface';

const KindOfRoomPage: FC<KindOfRoomPageProps> = ({ changeTourStep }) => {
  const [edit, setEdit] = useState('');
  const kindOfRoomGridRef: RefObject<KindOfRoomGridRef> = useRef(null);
  const kindOfRoomModalRef: RefObject<KindOfRoomModalRef> = useRef(null);

  return (
    <PageContainer
      extra={[
        <Button
          type='primary'
          onClick={() => {
            kindOfRoomModalRef.current!.openModal();
            setTimeout(() => {
              changeTourStep(2);
            }, 200);
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
            changeTourStep(3);
          }, 300);
        }}
      />
    </PageContainer>
  );
};

export default KindOfRoomPage;
