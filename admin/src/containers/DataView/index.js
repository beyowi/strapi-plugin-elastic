import React, { memo, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { GlobalPagination, request } from 'strapi-helper-plugin';
import { isObject } from 'lodash';
import { Table, Button, Select } from '@buffetjs/core';
import { LoadingBar } from '@buffetjs/styles';
import Wrapper from './Wrapper';

const LIMIT_OPTIONS = ['10', '20', '50', '100'];

const DataView = ({
  data = [],
  activeModel = '',
  loading,
  page,
  limit,
  totalCount,
  onChangeParams,
}) => {
  const tableHeaders = useMemo(
    () =>
      data && data.length
        ? Object.keys(data[0]).map((d) => ({ name: d, value: d }))
        : [],
    [data]
  );

  const tableData = useMemo(
    () =>
      data && data.length
        ? data.map((dataObject) => {
            let newObj = {};
            if (!dataObject) return newObj;

            for (let key in dataObject) {
              if (isObject(dataObject[key])) {
                newObj[key] = JSON.stringify(dataObject[key], null, 2);
              } else {
                newObj[key] = dataObject[key];
              }
            }

            return newObj;
          })
        : [],
    [data]
  );

  const [isMigrating, setIsMigrating] = useState(false);

  const migrate = () => {
    request(`/strapi-plugin-elastic/migrate-model`, {
      method: 'POST',
    })
      .then((res) => {
        if (res.success) alert('migration was successfull');
        else alert('migration failed');
      })
      .catch(() => alert('migration failed'))
      .finally(() => setIsMigrating(false));
  };

  return (
    <Wrapper>
      <div className="row px-4">
        <h2>{activeModel?.index?.toUpperCase()}</h2>
        <Button
          color="success"
          isLoading={isMigrating}
          onClick={migrate}
          className="ml-auto"
        >
          migrate
        </Button>
      </div>
      <hr />
      {loading ? (
        new Array(10).fill(0).map(() => (
          <>
            <LoadingBar />
            <div className="mt-3" />
          </>
        ))
      ) : (
        <>
          <Table headers={tableHeaders} rows={tableData} />
          <div className="mt-5 row align-items-center px-2">
            <Select
              name="params._limit"
              onChange={onChangeParams}
              options={LIMIT_OPTIONS}
              value={limit}
              className="col-2"
            />
            <div className="col-8 ml-auto">
              <GlobalPagination
                count={totalCount}
                onChangeParams={onChangeParams}
                params={{
                  _limit: parseInt(limit || 10, 10),
                  _page: page,
                }}
              />
            </div>
          </div>
        </>
      )}
    </Wrapper>
  );
};

DataView.propTypes = {
  data: PropTypes.array.isRequired,
  activeModel: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  page: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  limit: PropTypes.string.isRequired,
  onChangeParams: PropTypes.func.isRequired,
};

export default memo(DataView);
