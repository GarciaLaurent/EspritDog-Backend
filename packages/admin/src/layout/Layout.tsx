import * as React from 'react';
// import { useSelector } from 'react-redux';
import { Layout, LayoutProps, Sidebar } from 'react-admin';
import AppBar from './AppBar';
import { lightTheme } from './themes';

const CustomSidebar = (props: any) => <Sidebar {...props} size={200} />;

export default (props: LayoutProps) => {
  return (
    <Layout
      {...props}
      appBar={AppBar}
      sidebar={CustomSidebar}
      // menu={Menu}
      theme={lightTheme}
    />
  );
};
