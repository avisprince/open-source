import { Dropdown, Input, Option } from '@fluentui/react-components';

import Flexbox from 'src/components/custom/Flexbox';
import MySQLLogo from 'src/images/brands/mysql-icon.svg';
import PostgresLogo from 'src/images/brands/postgresql-icon.svg';
import { Stylesheet } from 'src/types/Stylesheet';

type Props = {
  name: string;
  extension: string;
  dbType: DB_TYPE;
  size: number;
  setName: (val: string) => void;
  setDbType: (dbType: DB_TYPE) => void;
};

export default function EditDatabaseFileForm({
  name,
  extension,
  dbType,
  size,
  setName,
  setDbType,
}: Props) {
  const currDbOption = DatabaseOptions.find(db => db.label === dbType);

  return (
    <Flexbox gap={16} direction="column">
      <Input
        placeholder="File name"
        value={name}
        onChange={e => setName(e.target.value)}
        contentAfter={`.${extension}`}
      />
      <Dropdown
        value={
          (!currDbOption ? (
            ''
          ) : (
            <Flexbox alignItems="center" gap={8}>
              {currDbOption.icon}
              <div>{currDbOption.label}</div>
            </Flexbox>
            // eslint-disable-next-line
          )) as any
        }
      >
        {DatabaseOptions.map(db => (
          <Option
            key={db.label}
            value={db.label}
            text={db.label}
            onClick={() => setDbType(db.label)}
          >
            <Flexbox alignItems="center" gap={8}>
              {db.icon}
              <div>{db.label}</div>
            </Flexbox>
          </Option>
        ))}
      </Dropdown>
      <Flexbox alignItems="center" gap={8}>
        <div>File Size:</div>
        <div>{size} B</div>
      </Flexbox>
    </Flexbox>
  );
}

const styles = {
  logo: {
    height: 24,
    width: 24,
  },
} satisfies Stylesheet;

export type DB_TYPE = 'mysql' | 'postgres';

type DB_OPTION = {
  icon: JSX.Element;
  label: DB_TYPE;
};

const DatabaseOptions: DB_OPTION[] = [
  {
    icon: <img src={MySQLLogo} style={styles.logo} />,
    label: 'mysql',
  },
  {
    icon: <img src={PostgresLogo} style={styles.logo} />,
    label: 'postgres',
  },
];
