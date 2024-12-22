import { Button } from '@fluentui/react-components';
import { useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';

import ConfirmModal from 'src/components/custom/ConfirmModal';
import DokkimiModal from 'src/components/custom/DokkimiModal';
import Flexbox from 'src/components/custom/Flexbox';
import EditDatabaseFileForm, {
  DB_TYPE,
} from 'src/components/dashboard/content/databaseFiles/EditDatabaseFileForm';
import useDeleteDatabaseFile from 'src/components/dashboard/content/databaseFiles/hooks/useDeleteDatabaseFile';
import useParsedFilename from 'src/components/dashboard/content/databaseFiles/hooks/useParsedFilename';
import useUpdateDatabaseFile from 'src/components/dashboard/content/databaseFiles/hooks/useUpdateDatabaseFile';
import EditDeleteMenu from 'src/components/dashboard/content/shared/EditDeleteMenu';
import { DokkimiColorsV2 } from 'src/components/styles/colors';
import MongoDBLogo from 'src/images/brands/mongodb-icon.svg';
import MySQLLogo from 'src/images/brands/mysql-icon.svg';
import PostgresLogo from 'src/images/brands/postgresql-icon.svg';
import { Stylesheet } from 'src/types/Stylesheet';

import { DatabaseFileCard_file$key } from './__generated__/DatabaseFileCard_file.graphql';

type Props = {
  fileRef: DatabaseFileCard_file$key;
};

export default function DatabaseFileCard({ fileRef }: Props) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [onUpdateFile] = useUpdateDatabaseFile();
  const [onDeleteFile] = useDeleteDatabaseFile();

  const file = useFragment(
    graphql`
      fragment DatabaseFileCard_file on Upload {
        id
        fileName
        fileSizeInBytes
        metadata {
          database
        }
      }
    `,
    fileRef,
  );

  const [filename, extension] = useParsedFilename(file.fileName);
  const [editName, setEditName] = useState(filename);
  const [editDbType, setEditDbType] = useState<DB_TYPE>(
    file.metadata.database as DB_TYPE,
  );

  const onClearClick = () => {
    setShowEditModal(false);
    setEditName(filename);
    setEditDbType(file.metadata.database as DB_TYPE);
  };

  const onSaveClick = () => {
    onUpdateFile(file.id, {
      fileName: `${editName}.${extension}`,
      database: editDbType,
    });
    setShowEditModal(false);
  };

  const logo = useMemo(() => {
    switch (file.metadata.database) {
      case 'mysql': {
        return <img src={MySQLLogo} style={styles.logo} />;
      }
      case 'postgres': {
        return <img src={PostgresLogo} style={styles.logo} />;
      }
      case 'mongodb': {
        return <img src={MongoDBLogo} style={styles.logo} />;
      }
      default: {
        return null;
      }
    }
  }, [file.metadata.database]);

  return (
    <Flexbox
      alignItems="center"
      justifyContent="space-between"
      style={styles.card}
    >
      <Flexbox alignItems="center" gap={16}>
        {logo}
        <div>{file.fileName}</div>
      </Flexbox>
      <EditDeleteMenu
        onEdit={() => setShowEditModal(true)}
        onDelete={() => setShowDeleteModal(true)}
      />
      <DokkimiModal
        isOpen={showEditModal}
        toggle={() => setShowEditModal(false)}
        showCloseButton
        width={600}
      >
        <Flexbox
          direction="column"
          alignItems="center"
          justifyContent="center"
          gap={40}
          style={styles.editModal}
        >
          <EditDatabaseFileForm
            name={editName}
            extension={extension}
            dbType={editDbType}
            size={file.fileSizeInBytes}
            setName={setEditName}
            setDbType={setEditDbType}
          />
          <Flexbox alignItems="center" gap={16} style={styles.modalButtons}>
            <Button onClick={onClearClick}>Clear</Button>
            <Button
              appearance="primary"
              style={styles.saveButton}
              onClick={onSaveClick}
              disabled={!editName || !editDbType}
            >
              Save
            </Button>
          </Flexbox>
        </Flexbox>
      </DokkimiModal>
      <ConfirmModal
        isOpen={showDeleteModal}
        toggle={() => setShowDeleteModal(false)}
        title="Delete Database File"
        subtitle={`Are you sure you want to delete the database file: ${file.fileName}?`}
        buttonText="Delete"
        onConfirm={() => onDeleteFile(file.id)}
      />
    </Flexbox>
  );
}

const styles = {
  card: {
    height: 80,
    width: 'calc(50% - 8px)',
    padding: 16,
    borderRadius: 4,
    backgroundColor: DokkimiColorsV2.blackQuaternary,
  },
  editModal: {
    padding: '0 40px 40px 40px',
  },
  logo: {
    height: 24,
    width: 24,
  },
  modalButtons: {
    width: 250,
  },
  saveButton: {
    flexGrow: 1,
  },
} satisfies Stylesheet;
