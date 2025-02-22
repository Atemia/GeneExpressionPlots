import { useDisclosure } from '@chakra-ui/hooks';
import { FocusableElement } from '@chakra-ui/utils';
import { Box } from '@chakra-ui/layout';
import React from 'react';

import { FaFileImport } from 'react-icons/fa';
import { VscGraphScatter } from 'react-icons/vsc';
import { MercatorFormSubmitHandler } from './mercator-form';
import FormikModal from '@/components/formik-modal';

import MercatorForm from './mercator-form';
import { dataTable } from '@/store/data-store';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '@chakra-ui/alert';
import { useToast } from '@chakra-ui/toast';
import CardButton from '@/components/card-button';
import {
  parseMercatorAndAddToInfoTable,
  validateMercator,
} from '@/utils/mercator';

const MapMan: React.FC = () => {
  const refInitialFocus = React.useRef<FocusableElement | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const onSubmit: MercatorFormSubmitHandler = (values, actions) => {
    const file = values.file;

    if (file) {
      try {
        const reader = new FileReader();

        reader.onload = () => {
          // validate Mercator input
          const header = (reader.result as string).split('\n', 1)[0];
          if (!validateMercator(header)) {
            toast({
              title: 'Error',
              status: 'error',
              description: 'Invalid Mercator Input.',
              isClosable: true,
            });
            return;
          } else {
            // Parse the input file as a table
            parseMercatorAndAddToInfoTable(reader.result as string, {
              addDescription: values.addDescription,
              addName: values.addName,
            });
            toast({
              title: 'Successfully imported Mercator table',
              status: 'success',
              description:
                'The provided Mercator tabular output was successfully imported into the application.',
              isClosable: true,
            });
          }
        };
        reader.onloadend = () => {
          actions.setSubmitting(false);
          onClose();
        };
        reader.onerror = () => {
          actions.setSubmitting(false);
          console.error('There was an error while reading the file');
        };

        reader.readAsText(file);
      } catch (error) {
        actions.setSubmitting(false);
        console.error(error);
      }
    }
  };

  return (
    <>
      <Box
        as="main"
        padding={6}
        width="100%"
        __css={{
          '& button:not(:first-of-type)': {
            marginTop: '2rem',
          },
        }}
      >
        {!dataTable.hasData ? (
          <Alert
            alignItems="center"
            flexDirection="column"
            minHeight="16rem"
            maxHeight="20rem"
            justifyContent="center"
            status="warning"
            textAlign="center"
            variant="subtle"
          >
            <AlertIcon boxSize="3rem" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              No data has been loaded
            </AlertTitle>
            <AlertDescription maxWidth="xl">
              It seems no data has been loaded into the application yet. You can
              load data from various formats in the Data section of the toolbar
              above.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <CardButton
              icon={VscGraphScatter}
              label="Mercator v4"
              text={`
              Use the Mercator v4 tool to annotate your genes with MapMan Bins. Clicking here
              will bring you to the plabipd online resources to run Mercator on your DNA or protein
              sequences. After running Mercator you can import the output table into GXP by using
              the Card below.
            `}
              onClick={() => window.open('https://plabipd.de/portal/mercator4')}
            />
            <CardButton
              icon={FaFileImport}
              label="Import Mercator output"
              text={`
              Import Mercator v4 tabular output into the GXP. Importing the file will automatically
              append the Mercator columns to already uploaded gene info. If no gene info was uploaded
              yet, the in memory gene info will be created for you.
            `}
              onClick={onOpen}
            />
          </>
        )}
      </Box>
      <FormikModal
        initialFocusRef={refInitialFocus}
        isOpen={isOpen}
        onClose={onClose}
        title="Load Mercator Table"
      >
        <MercatorForm
          initialFocusRef={refInitialFocus}
          onCancel={onClose}
          onSubmit={onSubmit}
        />
      </FormikModal>
    </>
  );
};

export default MapMan;
