import * as React from 'react';
import {
  Edit,
  SimpleForm,
  TextInput,
  EditProps,
  SelectInput,
} from 'react-admin';

const status = ['ORDERED', 'ACCEPTED', 'READY', 'FINISHED'];
const OrderEdit: React.FC<EditProps> = (props) => (
  <Edit {...props} undoable={false}>
    <SimpleForm>
      <TextInput disabled source="id" />
      <TextInput disabled source="user" />
      <TextInput disabled source="pharmacy" />
      <SelectInput
        source="status"
        choices={status.map((statusName) => {
          return {
            id: statusName,
            name: statusName,
          };
        })}
      />
    </SimpleForm>
  </Edit>
);

export default OrderEdit;
