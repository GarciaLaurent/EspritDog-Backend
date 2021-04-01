import simpleRestProvider from 'ra-data-simple-rest';
import { GetListParams, DataProvider } from 'ra-core';

const defaultProvider = simpleRestProvider('http://localhost:3333');

const transformedDataProvider: DataProvider = {
  ...defaultProvider,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  getList: async (resource: string, params: GetListParams) => {
    const { data, total } = await defaultProvider.getList(resource, params);
    return {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      data: data.data.map((element) => {
        return {
          ...element,
          id: element._id,
        };
      }),
      total,
    };
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  getOne: async (resource, params) => {
    const { data } = await defaultProvider.getOne(resource, params);

    return {
      data: {
        ...data,
        id: data._id,
      },
    };
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  update: async (resource, params) => {
    const { data } = await defaultProvider.update(resource, params);

    return {
      data: {
        ...data,
        id: data._id,
      },
    };
  },
};
export default transformedDataProvider;
