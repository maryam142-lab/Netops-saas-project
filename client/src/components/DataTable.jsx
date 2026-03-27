import Table from './ui/Table';

const DataTable = ({ columns, data, emptyLabel = 'No data available' }) => {
  return <Table columns={columns} data={data} emptyLabel={emptyLabel} />;
};

export default DataTable;
