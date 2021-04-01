import * as React from 'react';
import { List, Datagrid, TextField, EmailField, ListProps } from 'react-admin';

const UserList: React.FC<ListProps> = (props) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="user" />
      <TextField source="pharmacy" />
      <TextField source="status" />
    </Datagrid>
  </List>
);

export default UserList;
