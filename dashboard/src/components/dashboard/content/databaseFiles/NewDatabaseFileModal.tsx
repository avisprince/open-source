import { Button, ProgressBar } from '@fluentui/react-components';
import axios from 'axios';
import { useState } from 'react';
import { commitLocalUpdate, useRelayEnvironment } from 'react-relay';

import DokkimiModal from 'src/components/custom/DokkimiModal';
import Flexbox from 'src/components/custom/Flexbox';
import Upload from 'src/components/custom/Upload';
import EditDatabaseFileForm from 'src/components/dashboard/content/databaseFiles/EditDatabaseFileForm';
import { getAccessToken } from 'src/services/localStorage.service';
import { Stylesheet } from 'src/types/Stylesheet';

function parseFilename(filename: string) {
  const split = filename.split('.');
  const ext = split.pop() ?? '';
  return [split.join('.'), ext] as const;
}

type DB_OPTIONS = 'mysql' | 'postgres';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
};

export default function NewDatabaseFileModal({
  isOpen,
  onClose,
  orgId,
}: Props) {
  const environment = useRelayEnvironment();
  const [progress, setProgress] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [tempName, setTempName] = useState('');
  const [extension, setExtension] = useState('');
  const [dbType, setDbType] = useState<DB_OPTIONS>('mysql');

  const onFileReady = (file: File) => {
    setFile(file);
    setProgress(null);
    const [name, ext] = parseFilename(file.name);
    setTempName(name);
    setExtension(ext);
    setDbType('mysql');
  };

  const onClearClick = () => {
    setFile(null);
    setTempName('');
    setExtension('');
    setDbType('mysql');
  };

  const onModalClose = () => {
    onClearClick();
    onClose();
  };

  const onSaveClick = async () => {
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('newName', `${tempName}.${extension}`);
    formData.append('database', dbType);

    const response = await axios
      .post(
        `${import.meta.env.VITE_CT_DOMAIN}/upload/${orgId}/dbInitFile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
          },
        },
      )
      .then(res => res.data);

    commitLocalUpdate(environment, store => {
      const root = store.getRoot();
      const initFile = store.create(response.id as string, 'Upload');
      initFile.setValue(response.id as string, 'id');
      initFile.setValue(response.fileName as string, 'fileName');
      initFile.setValue(response.fileSizeInBytes as number, 'fileSizeInBytes');

      const metadata = store.create(
        `metadata:${response.id}`,
        'UploadMetadata',
      );
      metadata.setValue(response.metadata.database, 'database');
      initFile.setLinkedRecord(metadata, 'metadata');

      const args = { organizationId: orgId };
      const existingFiles = root.getLinkedRecords('orgDbInitFiles', args) ?? [];
      root.setLinkedRecords(
        [...existingFiles, initFile],
        'orgDbInitFiles',
        args,
      );
    });

    onModalClose();
  };

  return (
    <DokkimiModal
      isOpen={isOpen}
      toggle={onModalClose}
      showCloseButton
      width={600}
      height={300}
    >
      <Flexbox style={styles.modalContent} gap={16} justifyContent="center">
        <Upload setProgress={setProgress} onFileReady={onFileReady}>
          Drag your database init file here
        </Upload>
        {progress && (
          <Flexbox direction="column" fullWidth gap={8}>
            <Flexbox alignItems="center" justifyContent="space-between" gap={4}>
              <div>Uploading:</div>
              <div>{progress}%</div>
            </Flexbox>
            <ProgressBar value={progress / 100} thickness="large" />
          </Flexbox>
        )}
        {file && (
          <Flexbox
            direction="column"
            justifyContent="space-between"
            fullWidth
            style={styles.fileForm}
          >
            <EditDatabaseFileForm
              name={tempName}
              extension={extension}
              dbType={dbType}
              size={file.size}
              setName={setTempName}
              setDbType={setDbType}
            />
            <Flexbox alignItems="center" gap={16}>
              <Button onClick={onClearClick}>Clear</Button>
              <Button
                appearance="primary"
                style={styles.saveButton}
                onClick={onSaveClick}
                disabled={!tempName || !dbType}
              >
                Save
              </Button>
            </Flexbox>
          </Flexbox>
        )}
      </Flexbox>
    </DokkimiModal>
  );
}

const styles = {
  fileForm: {
    height: 206,
  },
  logo: {
    height: 24,
    width: 24,
  },
  modalContent: {
    padding: '0 40px 40px',
  },
  saveButton: {
    flexGrow: 1,
  },
} satisfies Stylesheet;
