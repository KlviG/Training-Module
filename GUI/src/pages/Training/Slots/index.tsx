import {FC, useEffect, useMemo, useState} from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { AxiosError } from 'axios';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { MdDeleteOutline, MdOutlineModeEditOutline } from 'react-icons/md';

import { Button, Card, DataTable, Dialog, FormInput, Icon, Track } from 'components';
import { Slot } from 'types/slot';
import { useToast } from 'hooks/useToast';
import { deleteSlot } from 'services/slots';
import i18n from '../../../../i18n';
import withAuthorization, { ROLES } from 'hoc/with-authorization';

const Slots: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('');
  const [deletableSlot, setDeletableSlot] = useState<string | number | null>(null);
  const { data: slots,refetch } = useQuery<Slot[]>({
    queryKey: ['slots'],
  });

  useEffect(() => {
    refetch()
  }, [slots,refetch]);
  setTimeout(() => refetch(), 300);

  const deleteSlotMutation = useMutation({
    mutationFn: ({ id }: { id: string | number }) => deleteSlot(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries(['slots']);
      refetch()
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: 'Slot deleted',
      });
    },
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
    onSettled: () => setDeletableSlot(null),
  });

  const slotsColumns = useMemo(() => getColumns(navigate, setDeletableSlot), []);

  if (!slots) return <>Loading...</>;

  return (
    <>
      <h1>{t('training.slots.title')}</h1>

      <Card header={
        <Track gap={16}>
          <FormInput
            label='search'
            name='search'
            placeholder={t('global.search') + '...'}
            hideLabel
            onChange={(e) => setFilter(e.target.value)}
          />
          <Button onClick={() => navigate('/training/slots/new')}>{t('global.add')}</Button>
        </Track>
      }>
        <DataTable data={slots} columns={slotsColumns} globalFilter={filter} setGlobalFilter={setFilter} sortable />
      </Card>

      {deletableSlot !== null && (
        <Dialog
          title={t('training.slots.deleteSlot')}
          onClose={() => setDeletableSlot(null)}
          footer={
            <>
              <Button appearance='secondary' onClick={() => setDeletableSlot(null)}>{t('global.no')}</Button>
              <Button
                appearance='error'
                onClick={() => deleteSlotMutation.mutate({ id: deletableSlot })}
              >
                {t('global.yes')}
              </Button>
            </>
          }
        >
          <p>{t('global.removeValidation')}</p>
        </Dialog>
      )}
    </>
  );
};

const getColumns = (
  navigate: NavigateFunction,
  setDeletableSlot: (id: number) => void,
) => {
  const columnHelper = createColumnHelper<Slot>();

  return [
    columnHelper.accessor('name', {
      header: i18n.t('training.slots.titleOne') || '',
    }),
    columnHelper.display({
      header: '',
      cell: (props) => (
        <Button
          appearance='text'
          onClick={() => navigate(`/training/slots/${props.row.original.id}`)}
        >
          <Icon
            label={i18n.t('global.edit')}
            icon={<MdOutlineModeEditOutline color={'rgba(0,0,0,0.54)'} />}
          />
          {i18n.t('global.edit')}
        </Button>
      ),
      id: 'edit',
      meta: {
        size: '1%',
      },
    }),
    columnHelper.display({
      header: '',
      cell: (props) => (
        <Button appearance='text' onClick={() => setDeletableSlot(props.row.original.id)}>
          <Icon
            label={i18n.t('global.delete')}
            icon={<MdDeleteOutline color={'rgba(0,0,0,0.54)'} />}
          />
          {i18n.t('global.delete')}
        </Button>
      ),
      id: 'delete',
      meta: {
        size: '1%',
      },
    }),
  ]
}

export default withAuthorization(Slots, [
  ROLES.ROLE_ADMINISTRATOR,
  ROLES.ROLE_CHATBOT_TRAINER,
  ROLES.ROLE_SERVICE_MANAGER,
]);
