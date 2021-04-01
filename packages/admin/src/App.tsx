import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  CREATE,
  UPDATE,
  Admin,
  Resource,
  DataProvider,
  LegacyDataProvider,
} from 'react-admin';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import simpleRestProvider from 'ra-data-simple-rest';

import './App.css';
import orders from './orders';

import authProvider from './authProvider';
import dataProvider from './dataProvider';

import { Login, Layout } from './layout';

const App = () => {
  // const [dataProvider, setDataProvider] = useState<DataProvider>();
  // useEffect(() => {
  //   const fetchDataProvider = async () => {
  //     const dataProviderInstance = await buildApolloClient({
  //       clientOptions: {
  //         uri:
  //           process.env.REACT_APP_GRAPHQL_SERVER_URL ||
  //           'http://localhost:3333/graphql',
  //       },
  //     });
  //     setDataProvider(() => dataProviderInstance);
  //   };
  //
  //   fetchDataProvider();
  // }, []);
  // const dataProvider = simpleRestProvider('http://localhost:3333');

  if (!dataProvider) {
    return (
      <div className="loader-container">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  return (
    <Admin
      title=""
      dataProvider={dataProvider}
      authProvider={authProvider}
      loginPage={Login}
      layout={Layout}
      // i18nProvider={i18nProvider}
      disableTelemetry
    >
      <Resource name="Orders" {...orders} />
    </Admin>
  );
};

export default App;
