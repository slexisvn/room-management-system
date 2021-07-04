import { FormInstance } from 'antd';
import { Dispatch, SetStateAction } from 'react';

export interface KindOfRoomModalProps {
  edit: string;
  onOk: () => void;
  onCancel: () => void;
}

export interface KindOfRoomModalRef {
  getForm: () => FormInstance;
  openModal: () => void;
}

export interface KindOfRoomGridProps {
  getKindOfRoomModalRef: () => KindOfRoomModalRef;
  edit: (id: string) => void;
}

export interface KindOfRoomGridRef {
  fetchData: () => void;
}

export interface KindOfRoomPageProps {
  changeTourStep: Dispatch<SetStateAction<number>>;
  changeTourOpen: Dispatch<SetStateAction<boolean>>;
}
