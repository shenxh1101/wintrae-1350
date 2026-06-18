import React from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import RoleSelector from '@/components/RoleSelector';
import './app.scss';

function App(props) {
  useDidShow(() => {});
  useDidHide(() => {});

  return (
    <>
      {props.children}
      <RoleSelector />
    </>
  );
}

export default App;
