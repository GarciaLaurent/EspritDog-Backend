import * as React from 'react';
import {
  List,
  Datagrid,
  TextField,
  EmailField,
  ListProps,
  FieldProps,
} from 'react-admin';
import { get, isEmpty } from 'lodash';
import MUIList from '@material-ui/core/List';
import MUIListItem from '@material-ui/core/ListItem';
import MUIListItemText from '@material-ui/core/ListItemText';

const PhotoField: React.FC<FieldProps> = ({ record, source }) => {
  if (!record || !source || isEmpty(get(record, source))) {
    return null;
  }
  return <img src={get(record, source)} />;
};

const ItemsField: React.FC<FieldProps> = ({ record, source }) => {
  if (!record || !source || isEmpty(get(record, source))) {
    return null;
  }
  const items = get(record, source);
  return (
    <MUIList dense={true}>
      {items.map((item: any) => {
        return (
          <MUIListItem>
            <MUIListItemText>
              {item.name} : {item.quantity}
            </MUIListItemText>
          </MUIListItem>
        );
      })}
    </MUIList>
  );
};

const UserList: React.FC<ListProps> = (props) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="user" />
      <TextField source="pharmacy" />
      <ItemsField source="items" />
      <PhotoField source="photo" />
      <TextField source="status" />
    </Datagrid>
  </List>
);

export default UserList;
